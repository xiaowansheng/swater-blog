package com.blog.plugin.components.mq;


import com.blog.plugin.core.Plugin;

/**
 * 消息队列插件接口
 */
public interface MessageQueuePlugin extends Plugin {
    void send(String exchange, String routingKey, Object message) throws Exception;
    
    void sendToQueue(String queue, Object message) throws Exception;
    
    void sendDelayed(String exchange, String routingKey, Object message, long delayMillis) throws Exception;
}
