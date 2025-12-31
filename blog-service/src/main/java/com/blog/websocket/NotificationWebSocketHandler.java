package com.blog.websocket;

import com.blog.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {
    private final Map<Long, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            sessions.put(userId, session);
            log.info("WebSocket连接建立，用户ID: {}", userId);
        } else {
            log.warn("WebSocket连接建立失败：无法获取用户ID");
            session.close();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            sessions.remove(userId);
            log.info("WebSocket连接关闭，用户ID: {}", userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.debug("收到WebSocket消息: {}", message.getPayload());
    }

    public void sendNotification(Long userId, Object notification) {
        WebSocketSession session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String message = JsonUtil.toJson(notification);
                session.sendMessage(new TextMessage(message));
            } catch (Exception e) {
                log.error("发送WebSocket消息失败，用户ID: {}", userId, e);
            }
        }
    }

    /**
     * 从 WebSocket Session 中获取用户 ID
     * <p>
     * 用户 ID 在握手阶段由 WebSocketHandshakeInterceptor 设置到 session 属性中
     * </p>
     *
     * @param session WebSocket 会话
     * @return 用户 ID，如果无法获取则返回 null
     */
    private Long getUserIdFromSession(WebSocketSession session) {
        Object userIdObj = session.getAttributes().get("userId");
        if (userIdObj instanceof Long) {
            return (Long) userIdObj;
        }
        if (userIdObj instanceof Integer) {
            return ((Integer) userIdObj).longValue();
        }
        if (userIdObj instanceof String) {
            try {
                return Long.parseLong((String) userIdObj);
            } catch (NumberFormatException e) {
                log.error("无法解析用户ID: {}", userIdObj);
                return null;
            }
        }
        return null;
    }
}

