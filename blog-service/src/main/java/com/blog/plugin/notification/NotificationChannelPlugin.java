package com.blog.plugin.notification;


import com.blog.plugin.core.Plugin;

public interface NotificationChannelPlugin extends Plugin {
    void send(Long userId, String type, String title, String content) throws Exception;
}
