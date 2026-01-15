package com.blog.plugin.components.mq;


import com.blog.plugin.core.Plugin;
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
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }

    public MessageQueuePlugin getActivePlugin() {
        List<MessageQueuePlugin> plugins = getPlugins();
        if (plugins.isEmpty()) {
            throw new IllegalStateException("No active MQ plugin found. Please configure plugin.mq.active property.");
        }
        if (plugins.size() > 1) {
            throw new IllegalStateException("Multiple MQ plugins are active: " +
                    plugins.stream().map(Plugin::getName).collect(Collectors.joining(", ")) +
                    ". Only one should be active.");
        }
        return plugins.get(0);
    }
}

