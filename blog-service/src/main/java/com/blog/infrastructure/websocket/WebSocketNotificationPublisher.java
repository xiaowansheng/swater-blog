package com.blog.infrastructure.websocket;

import com.blog.shared.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * WebSocket 通知发布器。
 * <p>
 * 通过 Redis pub/sub 把消息扇出到所有实例，解决「本地会话表 + 通知仅被单实例消费」
 * 导致的集群下其他实例在线用户收不到推送的问题。每个实例（含发布者自身）由
 * {@link WebSocketRedisSubscriber} 收到消息后投递给本机会话，保证每实例恰好投递一次。
 * Redis 不可用时降级为仅本机投递（等同单实例行为）。
 * </p>
 */
@Slf4j
@Component
public class WebSocketNotificationPublisher {

    public static final String TOPIC = "blog:ws:notification";

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private NotificationWebSocketHandler localHandler;

    public void sendToUser(Long userId, String message) {
        if (userId == null) {
            return;
        }
        publish(JsonUtil.toJson(Map.of("target", "user", "userId", userId, "message", message)));
    }

    public void broadcast(String message) {
        publish(JsonUtil.toJson(Map.of("target", "broadcast", "message", message)));
    }

    private void publish(String payload) {
        try {
            stringRedisTemplate.convertAndSend(TOPIC, payload);
        } catch (Exception e) {
            // Redis 故障时退化为本机投递，保持单实例行为可用
            log.warn("Redis 发布 WebSocket 消息失败，降级为本机投递: {}", e.getMessage());
            dispatchLocally(payload);
        }
    }

    static void dispatch(String payload, NotificationWebSocketHandler handler) {
        try {
            Map<String, Object> parsed = JsonUtil.fromJson(payload, Map.class);
            if (parsed == null) {
                return;
            }
            String message = String.valueOf(parsed.get("message"));
            if ("broadcast".equals(parsed.get("target"))) {
                handler.broadcast(message);
            } else if ("user".equals(parsed.get("target"))) {
                Object userId = parsed.get("userId");
                handler.sendToUser(userId instanceof Number number ? number.longValue() : Long.parseLong(String.valueOf(userId)), message);
            }
        } catch (Exception e) {
            log.error("分发 WebSocket 消息失败: {}", payload, e);
        }
    }

    private void dispatchLocally(String payload) {
        dispatch(payload, localHandler);
    }
}
