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

    private HttpServletRequest request(String remoteAddress, String forwardedFor, String realIp) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn(remoteAddress);
        when(request.getHeader("X-Forwarded-For")).thenReturn(forwardedFor);
        when(request.getHeader("X-Real-IP")).thenReturn(realIp);
        return request;
    }
}
