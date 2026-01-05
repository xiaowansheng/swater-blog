package com.blog.core.plugin.notification.impl;



import com.blog.core.plugin.core.Plugin;
import com.blog.core.plugin.notification.NotificationChannelPlugin;
import com.blog.core.websocket.NotificationWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import java.util.Map;
@Slf4j
@Component
@ConditionalOnProperty(name = "notification.websocket.enabled", havingValue = "true", matchIfMissing = true)
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
    public void send(Long userId, String type, String title, String content) throws Exception {
        if (webSocketHandler == null) {
            throw new IllegalStateException("WebSocketHandler未配置");
        }
        
        Map<String, Object> notification = Map.of(
                "type", type,
                "title", title,
                "content", content
        );
        
        // TODO: Fix WebSocket handler method signature
        // webSocketHandler.sendNotification(String.valueOf(userId), notification);
    }
}
