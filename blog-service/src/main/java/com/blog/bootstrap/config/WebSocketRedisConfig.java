package com.blog.bootstrap.config;

import com.blog.infrastructure.websocket.WebSocketNotificationPublisher;
import com.blog.infrastructure.websocket.WebSocketRedisSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

/**
 * WebSocket 集群广播的 Redis 订阅装配：
 * 每个实例订阅同一通知频道，收到后投递给本机会话。
 */
@Configuration
public class WebSocketRedisConfig {

    @Bean
    public RedisMessageListenerContainer webSocketRedisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            WebSocketRedisSubscriber subscriber) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(subscriber, new ChannelTopic(WebSocketNotificationPublisher.TOPIC));
        return container;
    }
}
