package com.blog.plugin.components.comment.config;


import com.blog.plugin.config.SinglePluginConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Comment provider plugin selection configuration.
 */
@Configuration
@ConfigurationProperties(prefix = "plugin.comment")
public class CommentPluginProperties implements SinglePluginConfig {

    private String active = "builtin";

    private String fallback;

    @Override
    public String getActive() {
        return active;
    }

    public void setActive(String active) {
        this.active = active;
    }

    @Override
    public String getFallback() {
        return fallback;
    }

    public void setFallback(String fallback) {
        this.fallback = fallback;
    }
}

