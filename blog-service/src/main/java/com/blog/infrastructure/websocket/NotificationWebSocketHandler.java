package com.blog.infrastructure.websocket;



import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import com.blog.shared.util.JsonUtil;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
@Slf4j
@Component
public class NotificationWebSocketHandler implements WebSocketHandler {
    
    private final ConcurrentHashMap<Long, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> sessionIdToUserId = new ConcurrentHashMap<>();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        Long userId = extractUserId(session);
        if (userId != null) {
            userSessions.computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet()).add(session);
            sessionIdToUserId.put(sessionId, userId);
            log.info("WebSocket connection established: sessionId={}, userId={}", sessionId, userId);
            return;
        }
        log.info("WebSocket connection established: sessionId={}, userId not found", sessionId);
    }
    
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        Object payloadObj = message.getPayload();
        String payload = payloadObj == null ? "" : String.valueOf(payloadObj);
        log.debug("Received message from {}: {}", session.getId(), payload);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = JsonUtil.fromJson(payload, Map.class);
            if (parsed != null && "ping".equals(parsed.get("type"))) {
                session.sendMessage(new TextMessage("{\"type\":\"pong\"}"));
            }
        } catch (Exception ignored) {
            // ignore non-json messages
        }
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket transport error for session {}: {}", session.getId(), exception.getMessage());
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String sessionId = session.getId();
        Long userId = sessionIdToUserId.remove(sessionId);
        if (userId != null) {
            Set<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.removeIf(existing -> sessionId.equals(existing.getId()));
                if (sessions.isEmpty()) {
                    userSessions.remove(userId, sessions);
                }
            }
        }
        log.info("WebSocket connection closed: sessionId={}, userId={}, closeStatus={}", sessionId, userId, closeStatus);
    }
    
    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
    
    public void sendToUser(Long userId, String message) {
        if (userId == null) return;
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions == null) return;
        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                } else {
                    sessions.remove(session);
                }
            } catch (Exception e) {
                log.error("Failed to send notification to userId={}, sessionId={}: {}", userId, session.getId(), e.getMessage());
            }
        }
    }

    public void broadcast(String message) {
        userSessions.values().forEach(sessions -> sessions.removeIf(session -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                    return false;
                }
                return true;
            } catch (Exception e) {
                log.error("Failed to broadcast notification to session {}: {}", session.getId(), e.getMessage());
                return false;
            }
        }));
    }

    private Long extractUserId(WebSocketSession session) {
        Object userId = session.getAttributes().get("userId");
        if (userId instanceof Long) return (Long) userId;
        if (userId instanceof Integer) return ((Integer) userId).longValue();
        if (userId instanceof String) {
            try {
                return Long.parseLong((String) userId);
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }
}
