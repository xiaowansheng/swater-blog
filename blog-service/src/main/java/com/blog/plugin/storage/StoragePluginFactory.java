package com.blog.plugin.storage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StoragePluginFactory {
    
    @Autowired
    private List<StoragePlugin> storagePlugins;
    
    public StoragePlugin getPlugin() {
        return storagePlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("未找到可用的存储插件"));
    }
}
