package com.blog.infrastructure.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

/**
 * Redis 订阅端：收到通知消息后投递给本实例的 WebSocket 会话。
 */
@Slf4j
@Component
public class WebSocketRedisSubscriber implements MessageListener {

    private final NotificationWebSocketHandler localHandler;

    public WebSocketRedisSubscriber(NotificationWebSocketHandler localHandler) {
        this.localHandler = localHandler;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String payload = new String(message.getBody(), java.nio.charset.StandardCharsets.UTF_8);
        WebSocketNotificationPublisher.dispatch(payload, localHandler);
    }
}
