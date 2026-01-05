package com.blog.plugin.notification;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class NotificationChannelFactory {
    
    @Autowired
    private List<NotificationChannelPlugin> channels;
    
    @Value("${notification.channels:websocket}")
    private List<String> enabledChannels;
    
    public List<NotificationChannelPlugin> getEnabledChannels() {
        if (enabledChannels == null || enabledChannels.isEmpty()) {
            enabledChannels = List.of("websocket");
        }
        
        final List<String> finalEnabledChannels = enabledChannels;
        return channels.stream()
                .filter(channel -> finalEnabledChannels.contains(channel.getName()))
                .filter(NotificationChannelPlugin::isEnabled)
                .collect(Collectors.toList());
    }
}
