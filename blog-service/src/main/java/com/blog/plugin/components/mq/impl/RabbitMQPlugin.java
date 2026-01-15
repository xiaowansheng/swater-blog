package com.blog.plugin.components.mq.impl;


import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.mq.MessageQueuePlugin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty(name = "plugin.mq.active", havingValue = "rabbitmq", matchIfMissing = false)
public class RabbitMQPlugin implements MessageQueuePlugin, Plugin {
    
    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;
    
    @Override
    public String getName() {
        return "rabbitmq";
    }
    
    @Override
    public boolean isEnabled() {
        if (rabbitTemplate == null) {
            return false;
        }
        rabbitTemplate.getConnectionFactory();
        return true;
    }
    
    @Override
    public void send(String exchange, String routingKey, Object message) throws Exception {
        if (!isEnabled()) {
            throw new IllegalStateException("RabbitMQ未配置");
        }
        
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }
    
    @Override
    public void sendToQueue(String queue, Object message) throws Exception {
        if (!isEnabled()) {
            throw new IllegalStateException("RabbitMQ未配置");
        }
        
        rabbitTemplate.convertAndSend(queue, message);
    }
    
    @Override
    public void sendDelayed(String exchange, String routingKey, Object message, long delayMillis) throws Exception {
        if (!isEnabled()) {
            throw new IllegalStateException("RabbitMQ未配置");
        }
        
        // RabbitMQ 延迟消息需要安装 rabbitmq-delayed-message-exchange 插件
        // 这里先使用普通发送，延迟消息功能需要额外配置
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }
}

