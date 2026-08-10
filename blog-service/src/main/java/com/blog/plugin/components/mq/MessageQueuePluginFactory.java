package com.blog.plugin.components.mq;


import com.blog.plugin.core.AbstractSinglePluginFactory;
import com.blog.plugin.core.Plugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MessageQueuePluginFactory extends AbstractSinglePluginFactory<MessageQueuePlugin> {

    @Autowired
    private List<MessageQueuePlugin> messageQueuePlugins;

    @Override
    public List<MessageQueuePlugin> getPlugins() {
        return messageQueuePlugins.stream()
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }

    @Override
    protected String getPluginTypeName() {
        return "MQ";
    }

    @Override
    protected String getConfigPropertyKey() {
        return "plugin.mq.active";
    }
}
