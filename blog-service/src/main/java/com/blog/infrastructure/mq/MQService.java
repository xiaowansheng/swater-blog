package com.blog.infrastructure.mq;


import com.blog.modules.notification.model.message.NotificationMessage;
import com.blog.plugin.components.mq.MessageQueuePlugin;
import com.blog.plugin.components.mq.MessageQueuePluginFactory;
import com.blog.shared.constant.ExchangeConstant;
import com.blog.shared.constant.QueueConstant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MQService {
    
    @Autowired(required = false)
    private MessageQueuePluginFactory mqPluginFactory;
    
    public void sendNotification(NotificationMessage message) {
        if (mqPluginFactory == null) {
            log.warn("MQ插件工厂未配置，跳过消息发送");
            return;
        }
        
        MessageQueuePlugin plugin = mqPluginFactory.getActivePlugin();
        
        if (plugin == null) {
            log.warn("没有启用的MQ插件，跳过消息发送");
            return;
        }
        
        try {
            String routingKey = getRoutingKey(message.getType());
            plugin.send(ExchangeConstant.NOTIFICATION_EXCHANGE, routingKey, message);
        } catch (Exception e) {
            log.error("发送通知消息到MQ失败，插件 {}", plugin, e);
        }
    }
    
    private String getRoutingKey(String type) {
        switch (type) {
            case "comment":
                return QueueConstant.COMMENT_NOTIFICATION_ROUTING_KEY;
            case "guestbook":
                return QueueConstant.GUESTBOOK_NOTIFICATION_ROUTING_KEY;
            case "login":
                return QueueConstant.LOGIN_NOTIFICATION_ROUTING_KEY;
            default:
                return QueueConstant.COMMENT_NOTIFICATION_ROUTING_KEY;
        }
    }
}
