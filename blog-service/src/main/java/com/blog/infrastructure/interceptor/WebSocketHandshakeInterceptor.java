package com.blog.infrastructure.interceptor;



import cn.dev33.satoken.stp.StpUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
/**
 * WebSocket 握手拦截器
 * <p>
 * 在 WebSocket 连接建立前进行权限验证，防止未授权用户建立连接
 * </p>
 *
 * @author Claude
 * @since 2025-12-31
 */
@Slf4j
@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private static final String TOKEN_PARAM = "token";

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                    WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        URI uri = request.getURI();
        String queryString = uri.getQuery();
        log.debug("WebSocket 握手请求: {}", uri);

        try {
            // 1. 从 URL 参数中获取 Token
            String token = extractTokenFromQuery(queryString);
            if (token == null || token.isEmpty()) {
                log.warn("WebSocket 连接被拒绝：未提供 Token, uri={}", uri);
                return false;
            }

            // 2. 使用 SaToken 验证 Token 并获取用户 ID
            Object loginId = StpUtil.getLoginIdByToken(token);
            if (loginId == null) {
                log.warn("WebSocket 连接被拒绝：Token 无效或已过期, uri={}", uri);
                return false;
            }

            // 3. 转换为 Long 类型的用户 ID
            Long userId;
            if (loginId instanceof Long) {
                userId = (Long) loginId;
            } else if (loginId instanceof Integer) {
                userId = ((Integer) loginId).longValue();
            } else if (loginId instanceof String) {
                userId = Long.parseLong((String) loginId);
            } else {
                log.warn("WebSocket 连接被拒绝：无法解析用户ID, loginId={}, uri={}", loginId, uri);
                return false;
            }

            // 4. 将用户 ID 存入 WebSocket Session 属性中
            attributes.put("userId", userId);

            log.info("WebSocket 连接验证通过: userId={}, uri={}", userId, uri);
            return true;

        } catch (Exception e) {
            log.error("WebSocket 握手验证失败: uri={}, error={}", uri, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket 握手后处理异常: {}", exception.getMessage());
        }
    }

    /**
     * 从 URL 查询字符串中提取 Token
     *
     * @param query URL 查询字符串
     * @return Token 值，如果不存在则返回 null
     */
    private String extractTokenFromQuery(String query) {
        if (query == null || query.isEmpty()) {
            return null;
        }

        String[] params = query.split("&");
        for (String param : params) {
            String[] keyValue = param.split("=");
            if (keyValue.length == 2 && TOKEN_PARAM.equals(keyValue[0])) {
                return URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }
}
