package com.blog.bootstrap.config;

import com.blog.shared.constant.QueueConstant;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 队列声明：业务队列绑定死信路由（default exchange + .dlq routing key），
 * 消费重试耗尽后消息进入对应 DLQ 而非直接丢弃，供人工排查/补偿。
 */
@Configuration
@ConditionalOnProperty(name = "plugin.mq.active", havingValue = "rabbitmq", matchIfMissing = false)
public class MqQueueConfig {

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(QueueConstant.NOTIFICATION_QUEUE)
                .deadLetterExchange("")
                .deadLetterRoutingKey(QueueConstant.NOTIFICATION_QUEUE + ".dlq")
                .build();
    }

    @Bean
    public Queue verificationCodeQueue() {
        return QueueBuilder.durable(QueueConstant.VERIFICATION_CODE_QUEUE)
                .deadLetterExchange("")
                .deadLetterRoutingKey(QueueConstant.VERIFICATION_CODE_QUEUE + ".dlq")
                .build();
    }

    @Bean
    public Queue notificationDeadLetterQueue() {
        return QueueBuilder.durable(QueueConstant.NOTIFICATION_QUEUE + ".dlq").build();
    }

    @Bean
    public Queue verificationCodeDeadLetterQueue() {
        return QueueBuilder.durable(QueueConstant.VERIFICATION_CODE_QUEUE + ".dlq").build();
    }
}
