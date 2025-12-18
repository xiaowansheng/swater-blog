package com.blog.listener;

import com.blog.model.message.LoginNotificationMessage;
import com.blog.service.NotificationService;
import com.blog.websocket.NotificationWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RabbitListener(queues = "login.notification.queue")
public class LoginNotificationConsumer {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationWebSocketHandler webSocketHandler;

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
                
                webSocketHandler.sendNotification(message.getUserId(),
                        Map.of("type", "login", "title", title, "content", content));
            }
        } catch (Exception e) {
            log.error("处理登录通知失败", e);
        }
    }
}

