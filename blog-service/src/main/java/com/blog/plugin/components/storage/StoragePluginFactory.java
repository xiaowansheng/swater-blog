package com.blog.plugin.components.storage;


import com.blog.plugin.core.Plugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class StoragePluginFactory {

    @Autowired
    private List<StoragePlugin> storagePlugins;

    public List<StoragePlugin> getPlugins() {
        return storagePlugins.stream()
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }

    /**
     * 获取单一存储插件。
     */
    public StoragePlugin getActivePlugin() {
        List<StoragePlugin> plugins = getPlugins();
        if (plugins.isEmpty()) {
            throw new IllegalStateException("No active storage plugin found. Please configure plugin.storage.active property.");
        }
        if (plugins.size() > 1) {
            throw new IllegalStateException("Multiple storage plugins are active: " +
                    plugins.stream().map(Plugin::getName).collect(Collectors.joining(", ")) +
                    ". Only one should be active.");
        }
        return plugins.get(0);
    }
}

