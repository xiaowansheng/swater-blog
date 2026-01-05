package com.blog.bootstrap.config;


import com.blog.infrastructure.interceptor.WebSocketHandshakeInterceptor;
import com.blog.infrastructure.websocket.NotificationWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final NotificationWebSocketHandler notificationWebSocketHandler;
    private final WebSocketHandshakeInterceptor webSocketHandshakeInterceptor;

    public WebSocketConfig(NotificationWebSocketHandler notificationWebSocketHandler,
                           WebSocketHandshakeInterceptor webSocketHandshakeInterceptor) {
        this.notificationWebSocketHandler = notificationWebSocketHandler;
        this.webSocketHandshakeInterceptor = webSocketHandshakeInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(notificationWebSocketHandler, "/ws/notification")
                .addInterceptors(webSocketHandshakeInterceptor)
                .setAllowedOrigins("*");
    }
}

