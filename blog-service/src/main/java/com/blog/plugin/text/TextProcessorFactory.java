package com.blog.plugin.text;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TextProcessorFactory {
    
    @Autowired
    private List<TextProcessorPlugin> processors;
    
    public TextProcessorPlugin getProcessor() {
        return processors.stream()
                .filter(processor -> processor instanceof com.blog.plugin.core.Plugin)
                .filter(processor -> ((com.blog.plugin.core.Plugin) processor).isEnabled())
                .findFirst()
                .orElse(null);
    }
}

