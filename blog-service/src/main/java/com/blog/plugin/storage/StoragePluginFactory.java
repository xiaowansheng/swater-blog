package com.blog.plugin.storage;



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
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .collect(Collectors.toList());
    }
}
