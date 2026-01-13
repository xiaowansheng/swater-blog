package com.blog.plugin.components.notification;


import com.blog.plugin.core.Plugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class NotificationChannelFactory {

    @Autowired
    private List<NotificationChannelPlugin> channels;

    public List<NotificationChannelPlugin> getEnabledChannels() {
        return channels.stream()
                .filter(Plugin::isEnabled)
                .collect(Collectors.toList());
    }
}

