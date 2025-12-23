package com.blog.plugin.search;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SearchPluginFactory {
    
    @Autowired
    private List<SearchPlugin> searchPlugins;
    
    public SearchPlugin getPlugin() {
        return searchPlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .findFirst()
                .orElse(null);
    }
}

