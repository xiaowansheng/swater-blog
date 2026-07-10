package com.blog.modules.system.log.task;

import com.blog.infrastructure.lock.RedisDistributedLock;
import com.blog.modules.system.log.service.LogErrorService;
import com.blog.modules.system.log.service.LogOperationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * 日志清理定时任务
 * <p>
 * 定时清理超过保留天数的操作日志和异常日志，防止 log_operation / log_error 表无限膨胀。
 * 操作/异常日志记录了完整请求参数和响应（单条最长 10KB），仅靠手动清理接口无法保证表容量可控。
 * </p>
 * <p>默认保留 90 天，可通过 {@code blog.scheduler.log-cleanup.retention-days} 配置。</p>
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "blog.scheduler.log-cleanup.enabled", havingValue = "true", matchIfMissing = true)
public class LogCleanupTask {

    private static final String LOCK_KEY = "blog:scheduler:log-cleanup:lock";
    private static final Duration LOCK_LEASE = Duration.ofSeconds(120);

    @Autowired
    private LogOperationService logOperationService;

    @Autowired
    private LogErrorService logErrorService;

    @Autowired
    private RedisDistributedLock distributedLock;

    /**
     * 每天凌晨 3:30 执行（错开文件清理任务的 2:00，避免清理类任务集中）。
     */
    @Scheduled(cron = "0 30 3 * * ?")
    public void cleanupExpiredLogs() {
        // 多实例部署下用分布式锁去重，避免每个实例重复清理同一批日志
        String token = distributedLock.tryLock(LOCK_KEY, LOCK_LEASE);
        if (token == null) {
            log.debug("日志清理任务未抢到分布式锁，跳过本次执行");
            return;
        }

        try {
            // 保留 90 天，与 LogController 手动清理接口的默认值一致
            int retentionDays = 90;
            log.info("开始执行日志清理任务，保留天数: {}", retentionDays);

            logOperationService.cleanup(retentionDays);
            logErrorService.cleanup(retentionDays);

            log.info("日志清理任务完成");
        } catch (Exception e) {
            log.error("日志清理任务执行失败: {}", e.getMessage(), e);
        } finally {
            distributedLock.unlock(LOCK_KEY, token);
        }
    }
}
