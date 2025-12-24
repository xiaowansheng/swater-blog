package com.blog.plugin.comment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CommentProviderFactory {
    
    @Autowired
    private List<CommentProviderPlugin> commentProviders;
    
    public List<CommentProviderPlugin> getProviders() {
        return commentProviders.stream()
                .filter(provider -> provider instanceof com.blog.plugin.core.Plugin)
                .filter(provider -> ((com.blog.plugin.core.Plugin) provider).isEnabled())
                .collect(Collectors.toList());
    }
}

