package com.blog.plugin.components.storage;


import com.blog.plugin.config.PluginProperties;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.core.PluginSelector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class StoragePluginFactory {
    
    @Autowired
    private List<StoragePlugin> storagePlugins;

    @Autowired
    private PluginProperties pluginProperties;
    
    public List<StoragePlugin> getPlugins() {
        return storagePlugins.stream()
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }

    /**
        获取单一存储插件，支持 active/fallback 配置。
     */
    public StoragePlugin getActivePlugin() {
        return PluginSelector.selectSingle(
                storagePlugins,
                pluginProperties.getStorage().getActive(),
                pluginProperties.getStorage().getFallback()
        );
    }
}
