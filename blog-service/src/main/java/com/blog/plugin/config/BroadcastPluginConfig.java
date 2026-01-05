package com.blog.plugin.config;

import java.util.List;

/**
 * Configuration contract for enabling multiple plugins in broadcast mode.
 */
public interface BroadcastPluginConfig {
    /**
     * Enabled plugin ids. Empty/null means enable all.
     */
    List<String> getEnabled();
}

