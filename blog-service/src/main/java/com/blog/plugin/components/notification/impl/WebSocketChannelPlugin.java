package com.blog.plugin.components.notification.impl;

import com.blog.infrastructure.websocket.NotificationWebSocketHandler;
import com.blog.plugin.components.notification.NotificationChannelPlugin;
import com.blog.plugin.core.Plugin;
import com.blog.shared.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.notification.websocket.active", havingValue = "websocket", matchIfMissing = false)
public class WebSocketChannelPlugin implements NotificationChannelPlugin, Plugin {

    @Autowired
    private NotificationWebSocketHandler webSocketHandler;

    @Override
    public String getName() {
        return "websocket";
    }

    @Override
    public boolean isEnabled() {
        return webSocketHandler != null;
    }

    @Override
    public void send(Long userId, String type, String title, String content) {
        if (webSocketHandler == null) {
            throw new IllegalStateException("WebSocketHandler not configured");
        }

        Map<String, Object> notification = Map.of(
                "type", type,
                "title", title,
                "content", content
        );

        webSocketHandler.sendToUser(userId, JsonUtil.toJson(notification));
    }
}

