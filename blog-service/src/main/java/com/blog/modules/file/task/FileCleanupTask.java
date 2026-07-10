package com.blog.modules.file.task;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.infrastructure.lock.RedisDistributedLock;
import com.blog.modules.file.mapper.FileMetaMapper;
import com.blog.modules.file.mapper.FileReferenceMapper;
import com.blog.modules.file.model.entity.FileMeta;
import com.blog.modules.file.service.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 文件清理定时任务
 * 定时清理引用数为0且更新时间超过7天的文件
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "blog.scheduler.file-cleanup.enabled", havingValue = "true", matchIfMissing = true)
public class FileCleanupTask {

    private static final String LOCK_KEY = "blog:scheduler:file-cleanup:lock";
    private static final Duration LOCK_LEASE = Duration.ofSeconds(120);

    @Autowired
    private FileMetaMapper fileMetaMapper;

    @Autowired
    private FileReferenceMapper fileReferenceMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    private RedisDistributedLock distributedLock;

    /**
     * 定时清理无用文件
     * 每天凌晨2点执行
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupUnusedFiles() {
        // 多实例部署下用分布式锁去重，避免每个实例重复清理同一批文件产生竞态
        String token = distributedLock.tryLock(LOCK_KEY, LOCK_LEASE);
        if (token == null) {
            log.debug("文件清理任务未抢到分布式锁，跳过本次执行");
            return;
        }

        try {
            doCleanup();
        } catch (Exception e) {
            log.error("文件清理任务执行失败: {}", e.getMessage(), e);
        } finally {
            distributedLock.unlock(LOCK_KEY, token);
        }
    }

    @Transactional
    protected void doCleanup() {
        log.info("开始执行文件清理任务...");

        // 计算过期时间：7天前
        LocalDateTime expireTime = LocalDateTime.now().minusDays(7);

        // 查询过期文件：ref_count = 0 且 update_time 超过7天
        List<FileMeta> expiredFiles = fileMetaMapper.selectList(
            new LambdaQueryWrapper<FileMeta>()
                .eq(FileMeta::getRefCount, 0)
                .lt(FileMeta::getUpdateTime, expireTime)
        );

        if (expiredFiles == null || expiredFiles.isEmpty()) {
            log.info("没有需要清理的过期文件");
            return;
        }

        log.info("发现 {} 个过期文件需要清理", expiredFiles.size());

        int successCount = 0;
        int failCount = 0;

        // 逐条清理：单条失败不影响其他文件（事务粒度由 fileService.delete 内部控制）
        for (FileMeta fileMeta : expiredFiles) {
            try {
                // 删除物理文件
                boolean deleted = deletePhysicalFile(fileMeta);

                if (deleted) {
                    // 删除数据库记录
                    fileMetaMapper.deleteById(fileMeta.getId());

                    // 删除引用关系（虽然ref_count=0，但为了保险起见）
                    fileReferenceMapper.deleteByFileId(fileMeta.getId());

                    successCount++;
                    log.info("成功清理过期文件: id={}, fileName={}", fileMeta.getId(), fileMeta.getOriginalName());
                } else {
                    failCount++;
                    log.warn("物理文件删除失败，跳过: id={}, filePath={}", fileMeta.getId(), fileMeta.getFilePath());
                }
            } catch (Exception e) {
                failCount++;
                log.error("清理文件失败: id={}, error={}", fileMeta.getId(), e.getMessage(), e);
            }
        }

        log.info("文件清理任务完成，成功: {}, 失败: {}", successCount, failCount);
    }

    /**
     * 删除物理文件
     * @param fileMeta 文件元数据
     * @return 是否删除成功
     */
    private boolean deletePhysicalFile(FileMeta fileMeta) {
        if (fileMeta.getFilePath() == null || fileMeta.getFilePath().isEmpty()) {
            log.warn("文件路径为空，无法删除: id={}", fileMeta.getId());
            return false;
        }

        try {
            File file = new File(fileMeta.getFilePath());

            if (file.exists()) {
                return file.delete();
            } else {
                log.warn("物理文件不存在，可能已被手动删除: id={}, filePath={}", fileMeta.getId(), fileMeta.getFilePath());
                // 文件不存在也算删除成功
                return true;
            }
        } catch (Exception e) {
            log.error("删除物理文件异常: id={}, filePath={}, error={}", fileMeta.getId(), fileMeta.getFilePath(), e.getMessage());
            return false;
        }
    }

    /**
     * 手动触发清理任务（用于测试）
     */
    public void manualCleanup() {
        log.info("手动触发文件清理任务");
        cleanupUnusedFiles();
    }
}
