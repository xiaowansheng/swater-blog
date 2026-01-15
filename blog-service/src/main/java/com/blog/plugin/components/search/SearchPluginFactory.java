package com.blog.plugin.components.search;


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

    public SearchPlugin getActivePlugin() {
        List<SearchPlugin> plugins = getPlugins();
        if (plugins.isEmpty()) {
            throw new IllegalStateException("No active search plugin found. Please configure plugin.search.active property.");
        }
        if (plugins.size() > 1) {
            throw new IllegalStateException("Multiple search plugins are active: " +
                    plugins.stream().map(p -> ((com.blog.plugin.core.Plugin) p).getName())
                            .collect(Collectors.joining(", ")) +
                    ". Only one should be active.");
        }
        return plugins.get(0);
    }
}

