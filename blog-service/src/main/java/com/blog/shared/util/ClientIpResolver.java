package com.blog.shared.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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
}
