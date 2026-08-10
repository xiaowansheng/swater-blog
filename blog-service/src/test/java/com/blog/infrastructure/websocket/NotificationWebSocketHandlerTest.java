package com.blog.infrastructure.websocket;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketExtension;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.Map;
import java.util.List;
import java.security.Principal;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationWebSocketHandlerTest {

    @Test
    void sendsNotificationsToAllSessionsForUser() throws Exception {
        NotificationWebSocketHandler handler = new NotificationWebSocketHandler();
        FakeWebSocketSession first = session("first");
        FakeWebSocketSession second = session("second");

        handler.afterConnectionEstablished(first);
        handler.afterConnectionEstablished(second);
        handler.sendToUser(1L, "message");

        assertThat(first.sentMessages).hasSize(1);
        assertThat(second.sentMessages).hasSize(1);
    }

    @Test
    void closingOneSessionDoesNotRemoveAnotherSessionForSameUser() throws Exception {
        NotificationWebSocketHandler handler = new NotificationWebSocketHandler();
        FakeWebSocketSession first = session("first");
        FakeWebSocketSession second = session("second");

        handler.afterConnectionEstablished(first);
        handler.afterConnectionEstablished(second);
        handler.afterConnectionClosed(first, CloseStatus.NORMAL);
        handler.sendToUser(1L, "message");

        assertThat(first.sentMessages).isEmpty();
        assertThat(second.sentMessages).hasSize(1);
    }

    private FakeWebSocketSession session(String id) {
        return new FakeWebSocketSession(id);
    }

    private static final class FakeWebSocketSession implements WebSocketSession {
        private final String id;
        private final List<WebSocketMessage<?>> sentMessages = new java.util.ArrayList<>();
        private boolean open = true;

        private FakeWebSocketSession(String id) {
            this.id = id;
        }

        @Override
        public String getId() {
            return id;
        }

        @Override
        public URI getUri() {
            return URI.create("ws://localhost/ws/notification");
        }

        @Override
        public HttpHeaders getHandshakeHeaders() {
            return new HttpHeaders();
        }

        @Override
        public Map<String, Object> getAttributes() {
            return Map.of("userId", 1L);
        }

        @Override
        public Principal getPrincipal() {
            return null;
        }

        @Override
        public InetSocketAddress getLocalAddress() {
            return null;
        }

        @Override
        public InetSocketAddress getRemoteAddress() {
            return null;
        }

        @Override
        public String getAcceptedProtocol() {
            return null;
        }

        @Override
        public void setTextMessageSizeLimit(int messageSize) {
        }

        @Override
        public int getTextMessageSizeLimit() {
            return 0;
        }

        @Override
        public void setBinaryMessageSizeLimit(int messageSize) {
        }

        @Override
        public int getBinaryMessageSizeLimit() {
            return 0;
        }

        @Override
        public List<WebSocketExtension> getExtensions() {
            return List.of();
        }

        @Override
        public void sendMessage(WebSocketMessage<?> message) throws IOException {
            sentMessages.add(message);
        }

        @Override
        public boolean isOpen() {
            return open;
        }

        @Override
        public void close() {
            open = false;
        }

        @Override
        public void close(CloseStatus status) {
            open = false;
        }
    }
}
