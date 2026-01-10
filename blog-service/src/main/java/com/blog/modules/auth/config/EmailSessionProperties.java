package com.blog.modules.auth.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "auth.email-session")
public class EmailSessionProperties {
    /**
     * HMAC secret for email verification session tokens.
     */
    private String secret = "change-me";

    /**
     * Token TTL in seconds.
     */
    private long ttlSeconds = 30L * 24 * 60 * 60; // 30 days

    /**
     * Header name to carry EVS token.
     */
    private String headerName = "X-Verify-Token";
}

