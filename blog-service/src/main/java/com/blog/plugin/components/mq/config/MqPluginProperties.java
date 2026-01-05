package com.blog.plugin.components.mq.config;


import com.blog.plugin.config.SinglePluginConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * MQ plugin selection configuration (rabbitmq/memory...).
 */
@Configuration
@ConfigurationProperties(prefix = "plugin.mq")
public class MqPluginProperties implements SinglePluginConfig {

    private String active = "rabbitmq";

    private String fallback = "memory";

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

