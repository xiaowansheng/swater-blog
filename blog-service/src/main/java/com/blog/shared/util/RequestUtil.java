package com.blog.shared.util;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
public class RequestUtil {
    public static HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return attributes.getRequest();
        }
        return null;
    }

    // 注意：此处不再提供 getClientIp。
    // 基于 X-Forwarded-For 等转发头的旧实现可被客户端伪造，会影响点赞去重、访问统计与登录归因。
    // 统一改用 {@link ClientIpResolver}（仅信任 security.forwarded-headers.trusted-proxies 配置的代理）。

    public static String getUserAgent(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        return request.getHeader("User-Agent");
    }

    public static String getUserAgent() {
        HttpServletRequest request = getRequest();
        return getUserAgent(request);
    }
}

