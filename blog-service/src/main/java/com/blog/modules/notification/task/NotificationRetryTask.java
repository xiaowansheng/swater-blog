package com.blog.modules.notification.task;

import com.blog.infrastructure.lock.RedisDistributedLock;
import com.blog.modules.notification.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
@ConditionalOnProperty(name = "notification.retry.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationRetryTask {

    private static final String LOCK_KEY = "blog:scheduler:notification-retry:lock";
    private static final Duration LOCK_LEASE = Duration.ofSeconds(300);

    private final NotificationService notificationService;
    private final RedisDistributedLock distributedLock;

    public NotificationRetryTask(NotificationService notificationService,
                                 RedisDistributedLock distributedLock) {
        this.notificationService = notificationService;
        this.distributedLock = distributedLock;
    }

    @Scheduled(fixedDelayString = "${notification.retry.delay-ms:60000}")
    public void retryFailed() {
        // 与其他定时任务一致用分布式锁去重；未抢到锁直接跳过（重试下一轮即可，重复投递反而有害）
        String token = distributedLock.tryLock(LOCK_KEY, LOCK_LEASE);
        if (token == null) {
            return;
        }
        try {
            notificationService.retryFailedNotifications();
        } catch (Exception e) {
            log.error("通知重试任务执行失败", e);
        } finally {
            distributedLock.unlock(LOCK_KEY, token);
        }
    }
}
