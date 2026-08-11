package com.blog.util;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class IpUtilTest {

    @Test
    void ignoresForwardedHeadersFromUntrustedPeers() {
        HttpServletRequest request = request("10.0.0.5", "203.0.113.10", "203.0.113.10");

        assertThat(com.blog.shared.util.IpUtil.getClientIp(request))
                .isEqualTo("10.0.0.5");
    }

    @Test
    void acceptsFirstForwardedAddressFromConfiguredProxyCidr() {
        HttpServletRequest request = request("10.0.0.5", "203.0.113.10, 10.0.0.5", null);

        assertThat(com.blog.shared.util.IpUtil.getClientIp(request, Set.of("10.0.0.0/8")))
                .isEqualTo("203.0.113.10");
    }

    @Test
    void prefersProxySuppliedRealIpOverClientControlledForwardedFor() {
        HttpServletRequest request = request("10.0.0.5", "198.51.100.20", "203.0.113.10");

        assertThat(com.blog.shared.util.IpUtil.getClientIp(request, Set.of("10.0.0.0/8")))
                .isEqualTo("203.0.113.10");
    }

    @Test
    void ignoresMalformedForwardedAddress() {
        HttpServletRequest request = request("10.0.0.5", "not-an-ip", "not-an-ip");

        assertThat(com.blog.shared.util.IpUtil.getClientIp(request, Set.of("10.0.0.5")))
                .isEqualTo("10.0.0.5");
    }

    @Test
    void trustsIpv6LoopbackProxyCidr() {
        // IPv6 部署：::1/128 代理 + X-Real-IP 提供真实客户端 IPv6。
        // 验证「IPv6 CIDR 代理被信任 + IPv6 X-Real-IP 被采纳」整条链路。
        HttpServletRequest request = request("0:0:0:0:0:0:0:1", null, "2001:db8::9");

        assertThat(com.blog.shared.util.IpUtil.getClientIp(request, Set.of("::1/128")))
                .isEqualTo("2001:db8::9");
    }

    @Test
    void trustsIpv6PrivateNetworkCidr() {
        // fd00::/8 IPv6 私有网段代理 + X-Forwarded-For 链
        HttpServletRequest request = request("fd00:dead:beef::1", "2001:db8::2", "2001:db8::2");

        assertThat(com.blog.shared.util.IpUtil.getClientIp(request, Set.of("fd00::/8")))
                .isEqualTo("2001:db8::2");
    }

    @Test
    void doesNotMatchIpv4CidrAgainstIpv6Address() {
        // 地址族不可混比：IPv6 客户端不应匹配 IPv4 CIDR
        HttpServletRequest request = request("fd00::1", null, "203.0.113.10");

        assertThat(com.blog.shared.util.IpUtil.getClientIp(request, Set.of("10.0.0.0/8")))
                .isEqualTo("fd00::1");
    }

    private HttpServletRequest request(String remoteAddress, String forwardedFor, String realIp) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn(remoteAddress);
        when(request.getHeader("X-Forwarded-For")).thenReturn(forwardedFor);
        when(request.getHeader("X-Real-IP")).thenReturn(realIp);
        return request;
    }
}
