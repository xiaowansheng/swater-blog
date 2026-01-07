package com.blog.bootstrap.config;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ 条件配置类
 * 只有当 mq.provider.type = rabbitmq 时才启用 RabbitMQ 相关配置
 */
@Configuration
@ConditionalOnProperty(name = "mq.provider.type", havingValue = "rabbitmq")
public class RabbitMQAutoConfiguration {

    /**
     * RabbitTemplate Bean
     * 仅在使用 RabbitMQ 时创建
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        return rabbitTemplate;
    }
}
