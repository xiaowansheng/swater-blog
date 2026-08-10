package com.blog.bootstrap.config;


import com.blog.infrastructure.interceptor.WebSocketHandshakeInterceptor;
import com.blog.infrastructure.websocket.NotificationWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;

import java.util.Set;
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final NotificationWebSocketHandler notificationWebSocketHandler;
    private final WebSocketHandshakeInterceptor webSocketHandshakeInterceptor;
    private final String allowedOriginPatterns;

    public WebSocketConfig(NotificationWebSocketHandler notificationWebSocketHandler,
                           WebSocketHandshakeInterceptor webSocketHandshakeInterceptor,
                           @Value("${security.websocket.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*}")
                           String allowedOriginPatterns) {
        this.notificationWebSocketHandler = notificationWebSocketHandler;
        this.webSocketHandshakeInterceptor = webSocketHandshakeInterceptor;
        this.allowedOriginPatterns = allowedOriginPatterns;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(notificationWebSocketHandler, "/ws/notification")
                .addInterceptors(webSocketHandshakeInterceptor)
                .setAllowedOriginPatterns(getAllowedOriginPatterns());
    }

    private String[] getAllowedOriginPatterns() {
        Set<String> patterns = StringUtils.commaDelimitedListToSet(allowedOriginPatterns);
        return patterns.toArray(String[]::new);
    }
}
