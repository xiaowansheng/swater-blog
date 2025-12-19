package com.blog.config;

import com.blog.constant.ExchangeConstant;
import com.blog.constant.QueueConstant;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(ExchangeConstant.NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Queue commentNotificationQueue() {
        return new Queue(QueueConstant.COMMENT_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding commentNotificationBinding() {
        return BindingBuilder.bind(commentNotificationQueue())
                .to(notificationExchange())
                .with(QueueConstant.COMMENT_NOTIFICATION_ROUTING_KEY);
    }
}

