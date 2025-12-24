package com.blog.config;

import com.blog.constant.ExchangeConstant;
import com.blog.constant.QueueConstant;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnBean(RabbitTemplate.class)
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

    @Bean
    public Queue guestbookNotificationQueue() {
        return new Queue(QueueConstant.GUESTBOOK_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding guestbookNotificationBinding() {
        return BindingBuilder.bind(guestbookNotificationQueue())
                .to(notificationExchange())
                .with(QueueConstant.GUESTBOOK_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Queue loginNotificationQueue() {
        return new Queue(QueueConstant.LOGIN_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding loginNotificationBinding() {
        return BindingBuilder.bind(loginNotificationQueue())
                .to(notificationExchange())
                .with(QueueConstant.LOGIN_NOTIFICATION_ROUTING_KEY);
    }
}

