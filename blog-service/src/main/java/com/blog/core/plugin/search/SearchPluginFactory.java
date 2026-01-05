package com.blog.core.plugin.search;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class SearchPluginFactory {
    
    @Autowired
    private List<SearchPlugin> searchPlugins;
    
    public List<SearchPlugin> getPlugins() {
        return searchPlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .collect(Collectors.toList());
    }
}

