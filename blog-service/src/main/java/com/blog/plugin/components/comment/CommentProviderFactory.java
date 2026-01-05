package com.blog.plugin.components.comment;


import com.blog.plugin.components.comment.config.CommentPluginProperties;
import com.blog.plugin.core.PluginSelector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CommentProviderFactory {
    
    @Autowired
    private List<CommentProviderPlugin> commentProviders;

    @Autowired
    private CommentPluginProperties commentPluginProperties;
    
    public List<CommentProviderPlugin> getProviders() {
        return commentProviders.stream()
                .filter(provider -> provider instanceof com.blog.plugin.core.Plugin)
                .filter(provider -> ((com.blog.plugin.core.Plugin) provider).isEnabled())
                .collect(Collectors.toList());
    }

    public CommentProviderPlugin getActiveProvider() {
        List<CommentProviderPlugin> enabled = getProviders();
        return PluginSelector.selectSingle(
                enabled,
                commentPluginProperties.getActive(),
                commentPluginProperties.getFallback()
        );
    }
}

