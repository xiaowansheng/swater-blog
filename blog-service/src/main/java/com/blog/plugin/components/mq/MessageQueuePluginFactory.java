package com.blog.plugin.components.mq;


import com.blog.plugin.components.mq.config.MqPluginProperties;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.core.PluginSelector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MessageQueuePluginFactory {
    
    @Autowired
    private List<MessageQueuePlugin> messageQueuePlugins;

    @Autowired
    private MqPluginProperties mqPluginProperties;
    
    public List<MessageQueuePlugin> getPlugins() {
        return messageQueuePlugins.stream()
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }

    public MessageQueuePlugin getActivePlugin() {
        return PluginSelector.selectSingle(
                messageQueuePlugins,
                mqPluginProperties.getActive(),
                mqPluginProperties.getFallback()
        );
    }
}

