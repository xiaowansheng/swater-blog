package com.blog.infrastructure.interceptor;



import cn.dev33.satoken.SaManager;
import cn.dev33.satoken.stp.StpUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
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
        String path = uri.getPath();
        log.debug("WebSocket 握手请求: path={}", path);

        try {
            // 1. 按优先级提取 Token：httpOnly Cookie > Authorization 头 > Sec-WebSocket-Protocol > 旧版 URL 参数
            String token = extractToken(request, queryString);
            if (token == null || token.isEmpty()) {
                log.warn("WebSocket 连接被拒绝：未提供 Token, path={}", path);
                return false;
            }

            // 2. 使用 SaToken 验证 Token 并获取用户 ID
            Object loginId = StpUtil.getLoginIdByToken(token);
            if (loginId == null) {
                log.warn("WebSocket 连接被拒绝：Token 无效或已过期, path={}", path);
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
                log.warn("WebSocket 连接被拒绝：无法解析用户ID, loginId={}, path={}", loginId, path);
                return false;
            }

            // 4. 将用户 ID 存入 WebSocket Session 属性中
            attributes.put("userId", userId);

            log.info("WebSocket 连接验证通过: userId={}, path={}", userId, path);
            return true;

        } catch (Exception e) {
            log.error("WebSocket 握手验证失败: path={}, error={}", path, e.getMessage(), e);
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
     * 提取握手携带的 Token，避免 Token 出现在 URL 和日志中。
     * 优先级：httpOnly Cookie > Authorization 头 > Sec-WebSocket-Protocol > 旧版 URL 参数（兼容）。
     */
    private String extractToken(ServerHttpRequest request, String queryString) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();

            String cookieToken = extractTokenFromCookie(httpRequest);
            if (cookieToken != null) {
                return cookieToken;
            }

            String headerToken = httpRequest.getHeader("Authorization");
            if (headerToken != null && !headerToken.isBlank()) {
                return stripBearerPrefix(headerToken);
            }
        }

        String protocolHeader = request.getHeaders().getFirst("Sec-WebSocket-Protocol");
        if (protocolHeader != null && !protocolHeader.isBlank()) {
            return stripBearerPrefix(protocolHeader);
        }

        return extractTokenFromQuery(queryString);
    }

    private String extractTokenFromCookie(HttpServletRequest httpRequest) {
        String cookieName = SaManager.getConfig().getTokenName();
        Cookie[] cookies = httpRequest.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isEmpty()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String stripBearerPrefix(String token) {
        String trimmed = token.trim();
        if (trimmed.startsWith("Bearer ")) {
            return trimmed.substring("Bearer ".length()).trim();
        }
        return trimmed;
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
