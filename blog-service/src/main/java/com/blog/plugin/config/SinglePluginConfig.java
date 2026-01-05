package com.blog.plugin.config;

/**
 * Configuration contract for selecting a single plugin with optional fallback.
 */
public interface SinglePluginConfig {
    /**
     * Primary plugin id.
     */
    String getActive();

    /**
     * Optional fallback plugin id.
     */
    String getFallback();
}

