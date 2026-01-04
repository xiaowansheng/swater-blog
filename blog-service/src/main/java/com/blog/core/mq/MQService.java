package com.blog.core.mq;



import com.blog.common.constant.ExchangeConstant;
import com.blog.common.constant.QueueConstant;
import com.blog.modules.notification.model.message.NotificationMessage;
import com.blog.core.plugin.core.Plugin;
import com.blog.core.plugin.mq.MessageQueuePlugin;
import com.blog.core.plugin.mq.MessageQueuePluginFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
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
        
        List<MessageQueuePlugin> plugins = mqPluginFactory.getPlugins();
        if (plugins.isEmpty()) {
            log.warn("没有可用的MQ插件，跳过消息发送");
            return;
        }
        
        MessageQueuePlugin plugin = plugins.stream()
                .filter(p -> p instanceof Plugin && ((Plugin) p).isEnabled())
                .findFirst()
                .orElse(null);
        
        if (plugin == null) {
            log.warn("没有启用的MQ插件，跳过消息发送");
            return;
        }
        
        try {
            String routingKey = getRoutingKey(message.getType());
            plugin.send(ExchangeConstant.NOTIFICATION_EXCHANGE, routingKey, message);
        } catch (Exception e) {
            String pluginName = plugin instanceof Plugin ? ((Plugin) plugin).getName() : "unknown";
            log.error("发送通知消息到MQ失败，插件: {}", pluginName, e);
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

