package com.blog.plugin.mq;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MessageQueuePluginFactory {
    
    @Autowired
    private List<MessageQueuePlugin> messageQueuePlugins;
    
    public MessageQueuePlugin getPlugin() {
        return messageQueuePlugins.stream()
                .filter(plugin -> plugin instanceof com.blog.plugin.core.Plugin)
                .filter(plugin -> ((com.blog.plugin.core.Plugin) plugin).isEnabled())
                .findFirst()
                .orElse(null);
    }
}

