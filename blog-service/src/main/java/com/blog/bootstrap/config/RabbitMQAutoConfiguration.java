package com.blog.bootstrap.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * RabbitMQ 条件配置类
 * 只有当 plugin.mq.active = rabbitmq 时才启用 RabbitMQ 相关配置
 */
@Slf4j
@Configuration
@ConditionalOnProperty(name = "plugin.mq.active", havingValue = "rabbitmq")
public class RabbitMQAutoConfiguration {

    /**
     * JSON 消息转换器：替代 JDK 序列化（跨版本脆弱且只允许 com.blog.* 白名单兜底）。
     * 复用 Spring Boot 自动装配的 ObjectMapper（已注册 JSR-310，支持 LocalDateTime），
     * copy 一份避免污染全局 ObjectMapper。
     * 注意：信任包按精确包名匹配（非前缀），需列出消息类所在的具体包。
     */
    @Bean
    public MessageConverter rabbitMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(
                objectMapper.copy(),
                "com.blog.modules.notification.model.message",
                "com.blog.modules.message.model.message",
                "java.util", "java.lang", "java.time");
    }

    /**
     * RabbitTemplate Bean
     * 仅在使用 RabbitMQ 时创建。
     * yml 已开启 publisher-confirm-type: correlated / publisher-returns，
     * 这里补上回调消费确认结果：发送失败要有日志可查，而不是静默丢失。
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter rabbitMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(rabbitMessageConverter);

        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            if (!ack) {
                log.error("RabbitMQ broker 未确认消息，cause={}, correlationData={}", cause, correlationData);
            }
        });
        rabbitTemplate.setReturnsCallback(returned -> log.error(
                "RabbitMQ 消息无法路由: exchange={}, routingKey={}, replyCode={}, replyText={}",
                returned.getExchange(), returned.getRoutingKey(),
                returned.getReplyCode(), returned.getReplyText()));

        return rabbitTemplate;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            SimpleRabbitListenerContainerFactoryConfigurer configurer,
            MessageConverter rabbitMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        configurer.configure(factory, connectionFactory);
        factory.setMessageConverter(rabbitMessageConverter);
        return factory;
    }
}
