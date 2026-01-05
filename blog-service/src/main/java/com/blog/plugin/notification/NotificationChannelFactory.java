package com.blog.plugin.notification;


import com.blog.plugin.config.PluginProperties;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.core.PluginSelector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class NotificationChannelFactory {
    
    @Autowired
    private List<NotificationChannelPlugin> channels;

    @Autowired
    private PluginProperties pluginProperties;
    
    public List<NotificationChannelPlugin> getEnabledChannels() {
        List<String> enabled = pluginProperties.getNotification().getEnabled();
        return PluginSelector.selectBroadcast(
                channels.stream()
                        .filter(Plugin::isEnabled)
                        .collect(Collectors.toList()),
                enabled
        );
    }
}
