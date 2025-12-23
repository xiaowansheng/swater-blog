package com.blog.listener;

import com.blog.model.message.CommentNotificationMessage;
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
@RabbitListener(queues = "comment.notification.queue")
public class CommentNotificationConsumer {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationChannelFactory channelFactory;

    @RabbitHandler
    public void handle(CommentNotificationMessage message) {
        try {
            log.info("收到评论通知消息: {}", message);
            
            if (message.getAuthorId() != null) {
                String title = "新评论通知";
                String content = String.format("%s 评论了你的文章《%s》", 
                        message.getCommenterName(), 
                        message.getPostTitle() != null ? message.getPostTitle() : "说说");
                
                notificationService.sendNotification(
                        message.getAuthorId(),
                        "comment",
                        title,
                        content
                );
                
                List<NotificationChannelPlugin> channels = channelFactory.getEnabledChannels();
                for (NotificationChannelPlugin channel : channels) {
                    try {
                        channel.send(message.getAuthorId(), "comment", title, content);
                    } catch (Exception e) {
                        log.error("通知渠道 {} 发送失败", channel.getName(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("处理评论通知失败", e);
        }
    }
}

