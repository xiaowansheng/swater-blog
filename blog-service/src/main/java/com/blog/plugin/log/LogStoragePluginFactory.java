package com.blog.plugin.log;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class LogStoragePluginFactory {
    
    @Autowired
    private List<LogStoragePlugin> logStoragePlugins;
    
    public List<LogStoragePlugin> getPlugins() {
        return logStoragePlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .collect(Collectors.toList());
    }
}

