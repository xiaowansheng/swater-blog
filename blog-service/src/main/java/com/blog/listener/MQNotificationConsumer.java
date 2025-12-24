package com.blog.listener;

import com.blog.constant.ExchangeConstant;
import com.blog.constant.QueueConstant;
import com.blog.model.message.NotificationMessage;
import com.blog.plugin.mq.impl.MemoryMQPlugin;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class MQNotificationConsumer {
    
    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;
    
    @Autowired(required = false)
    private MemoryMQPlugin memoryMQPlugin;
    
    @Autowired
    private NotificationMessageHandler notificationMessageHandler;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @PostConstruct
    public void init() {
        if (rabbitTemplate == null && memoryMQPlugin != null) {
            startMemoryMQConsumers();
        }
    }
    
    private void startMemoryMQConsumers() {
        if (memoryMQPlugin == null) {
            return;
        }
        
        startMemoryMQConsumer(QueueConstant.COMMENT_NOTIFICATION_QUEUE);
        startMemoryMQConsumer(QueueConstant.GUESTBOOK_NOTIFICATION_QUEUE);
        startMemoryMQConsumer(QueueConstant.LOGIN_NOTIFICATION_QUEUE);
    }
    
    private void startMemoryMQConsumer(String queue) {
        String routingKey = getRoutingKey(queue);
        String queueKey = ExchangeConstant.NOTIFICATION_EXCHANGE + "." + routingKey;
        BlockingQueue<Object> memoryQueue = memoryMQPlugin.getQueue(queueKey);
        new Thread(() -> {
            while (true) {
                try {
                    Object message = memoryQueue.poll(1, TimeUnit.SECONDS);
                    if (message != null) {
                        NotificationMessage notificationMessage = objectMapper.convertValue(message, NotificationMessage.class);
                        notificationMessageHandler.handle(notificationMessage);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("内存MQ消费消息失败，队列: {}", queue, e);
                }
            }
        }, "memory-mq-consumer-" + queue).start();
    }
    
    private String getRoutingKey(String queue) {
        if (queue.contains("comment")) {
            return "comment.notification";
        } else if (queue.contains("guestbook")) {
            return "guestbook.notification";
        } else if (queue.contains("login")) {
            return "login.notification";
        }
        return "comment.notification";
    }
    
    @RabbitListener(queues = QueueConstant.COMMENT_NOTIFICATION_QUEUE)
    @ConditionalOnBean(RabbitTemplate.class)
    public void handleCommentNotification(NotificationMessage message) {
        notificationMessageHandler.handle(message);
    }
    
    @RabbitListener(queues = QueueConstant.GUESTBOOK_NOTIFICATION_QUEUE)
    @ConditionalOnBean(RabbitTemplate.class)
    public void handleGuestbookNotification(NotificationMessage message) {
        notificationMessageHandler.handle(message);
    }
    
    @RabbitListener(queues = QueueConstant.LOGIN_NOTIFICATION_QUEUE)
    @ConditionalOnBean(RabbitTemplate.class)
    public void handleLoginNotification(NotificationMessage message) {
        notificationMessageHandler.handle(message);
    }
}

