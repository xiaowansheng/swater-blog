package com.blog.plugin.components.notification.impl;

import com.blog.infrastructure.websocket.WebSocketNotificationPublisher;
import com.blog.plugin.components.notification.NotificationChannelPlugin;
import com.blog.shared.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.notification.websocket.active", havingValue = "websocket", matchIfMissing = false)
public class WebSocketChannelPlugin implements NotificationChannelPlugin {

    // 经发布器走 Redis pub/sub 扇出到全部实例，避免集群下仅持有会话的实例收到推送
    @Autowired
    private WebSocketNotificationPublisher notificationPublisher;

    @Override
    public String getName() {
        return "websocket";
    }

    @Override
    public boolean isEnabled() {
        return notificationPublisher != null;
    }

    @Override
    public void send(Long userId, String type, String title, String content) {
        if (notificationPublisher == null) {
            throw new IllegalStateException("WebSocketNotificationPublisher not configured");
        }

        Map<String, Object> notification = Map.of(
                "type", type,
                "title", title,
                "content", content
        );

        notificationPublisher.sendToUser(userId, JsonUtil.toJson(notification));
    }
}
