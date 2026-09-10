package com.blog.shared.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Resolves the client IP while only trusting forwarding headers from configured proxies.
 */
@Component
public class ClientIpResolver {

    private final Set<String> trustedProxies;

    public ClientIpResolver(
            @Value("${security.forwarded-headers.trusted-proxies:}") String trustedProxyValue) {
        trustedProxies = Arrays.stream(trustedProxyValue == null ? new String[0] : trustedProxyValue.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    public String resolve(HttpServletRequest request) {
        return IpUtil.getClientIp(request, trustedProxies);
    }

    /**
     * 从 RequestContextHolder 取当前请求并解析客户端 IP，
     * 供无 request 参数的调用方（如 service 内部）使用。
     */
    public String resolve() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return resolve(attributes.getRequest());
        }
        return IpUtil.getClientIp(null, trustedProxies);
    }
}
