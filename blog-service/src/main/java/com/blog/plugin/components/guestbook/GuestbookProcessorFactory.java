package com.blog.plugin.components.guestbook;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class GuestbookProcessorFactory {
    
    @Autowired
    private List<GuestbookProcessorPlugin> processors;
    
    public List<GuestbookProcessorPlugin> getProcessors() {
        return processors.stream()
                .filter(processor -> processor instanceof com.blog.plugin.core.Plugin)
                .filter(processor -> ((com.blog.plugin.core.Plugin) processor).isEnabled())
                .collect(Collectors.toList());
    }
}

