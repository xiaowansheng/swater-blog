package com.blog.plugin.components.storage.config;


import com.blog.plugin.config.SinglePluginConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Storage plugin selection configuration (local/oss/qiniu...).
 */
@Configuration
@ConfigurationProperties(prefix = "plugin.storage")
public class StoragePluginProperties implements SinglePluginConfig {

    /**
     * Primary storage plugin id.
     */
    private String active = "local";

    /**
     * Optional fallback storage plugin id.
     */
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

