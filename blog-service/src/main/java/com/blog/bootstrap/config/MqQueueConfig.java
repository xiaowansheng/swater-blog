package com.blog.bootstrap.config;

import com.blog.shared.constant.QueueConstant;
import org.springframework.amqp.core.Queue;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "plugin.mq.active", havingValue = "rabbitmq", matchIfMissing = false)
public class MqQueueConfig {

    @Bean
    public Queue notificationQueue() {
        return new Queue(QueueConstant.NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Queue verificationCodeQueue() {
        return new Queue(QueueConstant.VERIFICATION_CODE_QUEUE, true);
    }
}
