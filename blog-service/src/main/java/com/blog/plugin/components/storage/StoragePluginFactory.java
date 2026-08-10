package com.blog.plugin.components.storage;


import com.blog.plugin.core.AbstractSinglePluginFactory;
import com.blog.plugin.core.Plugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class StoragePluginFactory extends AbstractSinglePluginFactory<StoragePlugin> {

    @Autowired
    private List<StoragePlugin> storagePlugins;

    @Override
    public List<StoragePlugin> getPlugins() {
        return storagePlugins.stream()
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }

    @Override
    protected String getPluginTypeName() {
        return "storage";
    }

    @Override
    protected String getConfigPropertyKey() {
        return "plugin.storage.active";
    }
}
