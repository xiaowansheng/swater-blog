package com.blog.plugin.components.notification;


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
                .filter(NotificationChannelPlugin::isEnabled)
                .collect(Collectors.toList());
    }
}
