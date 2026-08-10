package com.blog.plugin.components.search;


import com.blog.plugin.core.AbstractSinglePluginFactory;
import com.blog.plugin.core.Plugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SearchPluginFactory extends AbstractSinglePluginFactory<SearchPlugin> {

    @Autowired
    private List<SearchPlugin> searchPlugins;

    @Override
    public List<SearchPlugin> getPlugins() {
        return searchPlugins.stream()
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }

    @Override
    protected String getPluginTypeName() {
        return "search";
    }

    @Override
    protected String getConfigPropertyKey() {
        return "plugin.search.active";
    }
}
