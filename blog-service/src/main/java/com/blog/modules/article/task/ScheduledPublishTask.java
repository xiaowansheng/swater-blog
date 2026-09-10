package com.blog.modules.article.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.infrastructure.lock.RedisDistributedLock;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.service.ArticleCommandService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 * 定时发布调度。
 *
 * 多实例部署下，借助 Redis 分布式锁保证同一时刻只有一个实例执行扫描，
 * 避免文章被重复发布（进而触发重复的 Webhook / 邮件通知）。
 * 单实例或 Redis 不可用时，降级为「本实例执行」以保证功能可用。
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "blog.scheduler.publish.enabled", havingValue = "true", matchIfMissing = true)
public class ScheduledPublishTask {

    /** 批次级锁：60s 触发一次，持有 90s 足以覆盖单次扫描+发布。 */
    private static final String LOCK_KEY = "blog:scheduler:publish:lock";
    private static final Duration LOCK_LEASE = Duration.ofSeconds(90);

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleCommandService articleCommandService;

    @Autowired
    private RedisDistributedLock distributedLock;

    @Scheduled(fixedDelay = 60000)
    public void publishScheduledArticles() {
        // 抢占锁；获取不到分两种情况：
        // 1) 其他实例持有锁 → 跳过本轮；
        // 2) Redis 不可用 → 降级为本实例执行（发布按状态幂等，重复扫描无害），保证定时发布不停摆
        String token = distributedLock.tryLock(LOCK_KEY, LOCK_LEASE);
        if (token == null && distributedLock.isAvailable()) {
            log.debug("定时发布任务未抢到分布式锁，跳过本次执行");
            return;
        }
        try {
            List<Article> scheduled = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                    .eq(Article::getStatus, ArticleStatus.SCHEDULED.getCode())
                    .le(Article::getPublishedAt, java.time.LocalDateTime.now())
                    .eq(Article::getDeleted, 0));
            if (scheduled.isEmpty()) {
                return;
            }
            for (Article article : scheduled) {
                try {
                    articleCommandService.publish(article.getId());
                    log.info("定时发布文章成功, id={}, title={}", article.getId(), article.getTitle());
                } catch (Exception e) {
                    log.error("定时发布文章失败, id={}", article.getId(), e);
                }
            }
        } catch (Exception e) {
            log.error("检查定时发布文章失败", e);
        } finally {
            distributedLock.unlock(LOCK_KEY, token);
        }
    }
}
