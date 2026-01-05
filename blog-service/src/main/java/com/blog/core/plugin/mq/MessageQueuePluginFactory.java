package com.blog.core.plugin.mq;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class MessageQueuePluginFactory {
    
    @Autowired
    private List<MessageQueuePlugin> messageQueuePlugins;
    
    public List<MessageQueuePlugin> getPlugins() {
        return messageQueuePlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .collect(Collectors.toList());
    }
}

