package com.blog.modules.notification.task;

import com.blog.modules.notification.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "notification.retry.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationRetryTask {

    private final NotificationService notificationService;

    public NotificationRetryTask(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelayString = "${notification.retry.delay-ms:60000}")
    public void retryFailed() {
        try {
            notificationService.retryFailedNotifications();
        } catch (Exception e) {
            log.error("通知重试任务执行失败", e);
        }
    }
}
