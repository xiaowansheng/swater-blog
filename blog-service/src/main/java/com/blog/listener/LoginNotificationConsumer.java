package com.blog.listener;

import com.blog.model.message.LoginNotificationMessage;
import com.blog.plugin.notification.NotificationChannelFactory;
import com.blog.plugin.notification.NotificationChannelPlugin;
import com.blog.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RabbitListener(queues = "login.notification.queue")
public class LoginNotificationConsumer {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationChannelFactory channelFactory;

    @RabbitHandler
    public void handle(LoginNotificationMessage message) {
        try {
            log.info("收到登录通知消息: {}", message);
            
            if (message.getUserId() != null) {
                String title = "登录通知";
                String content = String.format("你的账号在 %s 登录，IP: %s", 
                        message.getIpAddress() != null ? message.getIpAddress() : message.getIp(),
                        message.getIp());
                
                notificationService.sendNotification(
                        message.getUserId(),
                        "login",
                        title,
                        content
                );
                
                List<NotificationChannelPlugin> channels = channelFactory.getEnabledChannels();
                for (NotificationChannelPlugin channel : channels) {
                    try {
                        channel.send(message.getUserId(), "login", title, content);
                    } catch (Exception e) {
                        log.error("通知渠道 {} 发送失败", channel.getName(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("处理登录通知失败", e);
        }
    }
}

