package com.blog.infrastructure.mq.consumer;

import com.blog.modules.notification.model.message.NotificationMessage;
import com.blog.modules.notification.service.NotificationServiceImpl;
import com.blog.shared.constant.QueueConstant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.mq.active", havingValue = "rabbitmq", matchIfMissing = false)
public class RabbitMqNotificationConsumer {

    private final NotificationServiceImpl notificationService;

    public RabbitMqNotificationConsumer(NotificationServiceImpl notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = QueueConstant.NOTIFICATION_QUEUE)
    public void handleNotification(NotificationMessage message) {
        notificationService.processNotificationMessage(message);
    }
}
