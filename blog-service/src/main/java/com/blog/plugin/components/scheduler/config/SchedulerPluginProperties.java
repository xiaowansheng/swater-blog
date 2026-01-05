package com.blog.plugin.components.scheduler.config;


import com.blog.plugin.config.SinglePluginConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Scheduler plugin selection configuration.
 */
@Configuration
@ConfigurationProperties(prefix = "plugin.scheduler")
public class SchedulerPluginProperties implements SinglePluginConfig {

    private String active = "spring";

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

