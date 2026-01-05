package com.blog.plugin.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.ArrayList;
import java.util.List;

/**
 * 插件选择相关配置。
 */
@Configuration
@ConfigurationProperties(prefix = "plugin")
public class PluginProperties {

    private final SinglePluginProperties storage = new SinglePluginProperties("local", null);
    private final SinglePluginProperties mq = new SinglePluginProperties("rabbit", "memory");
    private final BroadcastPluginProperties notification = new BroadcastPluginProperties();

    public SinglePluginProperties getStorage() {
        return storage;
    }

    public SinglePluginProperties getMq() {
        return mq;
    }

    public BroadcastPluginProperties getNotification() {
        return notification;
    }

    public static class SinglePluginProperties {
        /**
         * 主用插件 id
         */
        private String active;
        /**
         * 降级插件 id（可选）
         */
        private String fallback;

        public SinglePluginProperties() {
        }

        public SinglePluginProperties(String active, String fallback) {
            this.active = active;
            this.fallback = fallback;
        }

        public String getActive() {
            return active;
        }

        public void setActive(String active) {
            this.active = active;
        }

        public String getFallback() {
            return fallback;
        }

        public void setFallback(String fallback) {
            this.fallback = fallback;
        }
    }

    public static class BroadcastPluginProperties {
        /**
         * 启用的插件 id 列表，按顺序广播；空则全启用。
         */
        private List<String> enabled = new ArrayList<>();

        public List<String> getEnabled() {
            return enabled;
        }

        public void setEnabled(List<String> enabled) {
            this.enabled = enabled;
        }
    }
}
