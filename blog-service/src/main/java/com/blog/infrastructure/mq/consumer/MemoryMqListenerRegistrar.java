package com.blog.infrastructure.mq.consumer;

import com.blog.modules.message.model.message.VerificationCodeMessage;
import com.blog.modules.message.service.impl.MessageVerificationServiceImpl;
import com.blog.modules.notification.model.message.NotificationMessage;
import com.blog.modules.notification.service.NotificationServiceImpl;
import com.blog.plugin.components.mq.MessageQueuePlugin;
import com.blog.plugin.components.mq.MessageQueuePluginFactory;
import com.blog.plugin.components.mq.impl.MemoryMQPlugin;
import com.blog.shared.constant.QueueConstant;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.mq.active", havingValue = "memory", matchIfMissing = false)
public class MemoryMqListenerRegistrar {

    private final MessageQueuePluginFactory mqPluginFactory;
    private final NotificationServiceImpl notificationService;
    private final MessageVerificationServiceImpl messageVerificationService;

    public MemoryMqListenerRegistrar(
            MessageQueuePluginFactory mqPluginFactory,
            NotificationServiceImpl notificationService,
            MessageVerificationServiceImpl messageVerificationService
    ) {
        this.mqPluginFactory = mqPluginFactory;
        this.notificationService = notificationService;
        this.messageVerificationService = messageVerificationService;
    }

    @PostConstruct
    public void registerListeners() {
        MessageQueuePlugin plugin;
        try {
            plugin = mqPluginFactory.getActivePlugin();
        } catch (Exception e) {
            log.warn("未配置可用的MQ插件，跳过内存队列监听注册", e);
            return;
        }
        if (!(plugin instanceof MemoryMQPlugin memoryPlugin)) {
            log.warn("当前MQ插件不是内存实现，跳过内存队列监听注册");
            return;
        }

        memoryPlugin.addListener(QueueConstant.NOTIFICATION_QUEUE, message -> {
            if (message instanceof NotificationMessage notificationMessage) {
                notificationService.processNotificationMessage(notificationMessage);
            } else {
                log.warn("通知消息类型不匹配: {}", message == null ? "null" : message.getClass().getName());
            }
        });

        memoryPlugin.addListener(QueueConstant.VERIFICATION_CODE_QUEUE, message -> {
            if (message instanceof VerificationCodeMessage verificationCodeMessage) {
                messageVerificationService.processVerificationMessage(verificationCodeMessage);
            } else {
                log.warn("验证码消息类型不匹配: {}", message == null ? "null" : message.getClass().getName());
            }
        });

        log.info("内存MQ监听器注册完成");
    }
}
