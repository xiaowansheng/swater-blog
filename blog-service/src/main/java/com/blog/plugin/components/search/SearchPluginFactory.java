package com.blog.plugin.components.search;


import com.blog.plugin.components.search.config.SearchPluginProperties;
import com.blog.plugin.core.PluginSelector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SearchPluginFactory {
    
    @Autowired
    private List<SearchPlugin> searchPlugins;

    @Autowired
    private SearchPluginProperties searchPluginProperties;
    
    public List<SearchPlugin> getPlugins() {
        return searchPlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .collect(Collectors.toList());
    }

    public SearchPlugin getActivePlugin() {
        List<SearchPlugin> enabled = getPlugins();
        return PluginSelector.selectSingle(
                enabled,
                searchPluginProperties.getActive(),
                searchPluginProperties.getFallback()
        );
    }
}

