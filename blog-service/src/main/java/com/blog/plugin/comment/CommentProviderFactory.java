package com.blog.plugin.comment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CommentProviderFactory {
    
    @Autowired
    private List<CommentProviderPlugin> commentProviders;
    
    public CommentProviderPlugin getProvider() {
        return commentProviders.stream()
                .filter(provider -> provider instanceof com.blog.plugin.core.Plugin)
                .filter(provider -> ((com.blog.plugin.core.Plugin) provider).isEnabled())
                .findFirst()
                .orElse(null);
    }
}

