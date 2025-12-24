package com.blog.plugin.comment.processor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CommentProcessorFactory {
    
    @Autowired
    private List<CommentProcessorPlugin> processors;
    
    public CommentProcessorPlugin getProcessor() {
        return processors.stream()
                .filter(processor -> processor instanceof com.blog.plugin.core.Plugin)
                .filter(processor -> ((com.blog.plugin.core.Plugin) processor).isEnabled())
                .findFirst()
                .orElse(null);
    }
}

