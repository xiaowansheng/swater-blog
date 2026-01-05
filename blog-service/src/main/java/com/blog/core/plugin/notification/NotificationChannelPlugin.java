package com.blog.core.plugin.notification;

public interface NotificationChannelPlugin {
    void send(Long userId, String type, String title, String content) throws Exception;
    
    String getName();
    
    boolean isEnabled();
}
