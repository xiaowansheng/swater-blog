package com.blog.plugin.comment.processor;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class CommentProcessorFactory {
    
    @Autowired
    private List<CommentProcessorPlugin> processors;
    
    public List<CommentProcessorPlugin> getProcessors() {
        return processors.stream()
                .filter(processor -> processor instanceof com.blog.plugin.core.Plugin)
                .filter(processor -> ((com.blog.plugin.core.Plugin) processor).isEnabled())
                .collect(Collectors.toList());
    }
}

