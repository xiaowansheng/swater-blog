package com.blog.plugin.components.notification.config;


import com.blog.plugin.config.BroadcastPluginConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.ArrayList;
import java.util.List;

/**
 * Notification channel selection configuration (websocket/email...).
 */
@Configuration
@ConfigurationProperties(prefix = "plugin.notification")
public class NotificationChannelProperties implements BroadcastPluginConfig {

    /**
     * Enabled channel ids; empty means enable all available.
     */
    private List<String> enabled = new ArrayList<>();

    @Override
    public List<String> getEnabled() {
        return enabled;
    }

    public void setEnabled(List<String> enabled) {
        this.enabled = enabled;
    }
}

