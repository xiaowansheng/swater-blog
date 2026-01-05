package com.blog.core.plugin.text;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class TextProcessorFactory {
    
    @Autowired
    private List<TextProcessorPlugin> processors;
    
    public List<TextProcessorPlugin> getProcessors() {
        return processors.stream()
                .filter(processor -> processor instanceof com.blog.plugin.core.Plugin)
                .filter(processor -> ((com.blog.plugin.core.Plugin) processor).isEnabled())
                .collect(Collectors.toList());
    }
}

