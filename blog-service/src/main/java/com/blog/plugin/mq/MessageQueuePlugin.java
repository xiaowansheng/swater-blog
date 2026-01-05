package com.blog.plugin.mq;

/**
 * 消息队列插件接口
 */
public interface MessageQueuePlugin {
    /**
     * 发送消息
     * @param exchange 交换机名称
     * @param routingKey 路由键
     * @param message 消息对象
     */
    void send(String exchange, String routingKey, Object message) throws Exception;
    
    /**
     * 发送消息到指定队列
     * @param queue 队列名称
     * @param message 消息对象
     */
    void sendToQueue(String queue, Object message) throws Exception;
    
    /**
     * 发送延迟消息
     * @param exchange 交换机名称
     * @param routingKey 路由键
     * @param message 消息对象
     * @param delayMillis 延迟时间（毫秒）
     */
    void sendDelayed(String exchange, String routingKey, Object message, long delayMillis) throws Exception;
}

