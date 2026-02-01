package com.blog.infrastructure.mq;


import com.blog.modules.message.model.message.VerificationCodeMessage;
import com.blog.modules.notification.model.message.NotificationMessage;
import com.blog.plugin.components.mq.MessageQueuePlugin;
import com.blog.plugin.components.mq.MessageQueuePluginFactory;
import com.blog.shared.constant.QueueConstant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MQService {
    
    @Autowired(required = false)
    private MessageQueuePluginFactory mqPluginFactory;
    
    public boolean sendNotification(NotificationMessage message) {
        if (mqPluginFactory == null) {
            log.warn("MQ插件工厂未配置，跳过消息发送");
            return false;
        }
        
        MessageQueuePlugin plugin;
        try {
            plugin = mqPluginFactory.getActivePlugin();
        } catch (Exception e) {
            log.warn("没有启用的MQ插件，跳过消息发送", e);
            return false;
        }
        
        try {
            plugin.sendToQueue(QueueConstant.NOTIFICATION_QUEUE, message);
            return true;
        } catch (Exception e) {
            log.error("发送通知消息到MQ失败，插件 {}", plugin, e);
            return false;
        }
    }

    public boolean sendVerificationCode(VerificationCodeMessage message) {
        if (mqPluginFactory == null) {
            log.warn("MQ插件工厂未配置，跳过验证码消息发送");
            return false;
        }

        MessageQueuePlugin plugin;
        try {
            plugin = mqPluginFactory.getActivePlugin();
        } catch (Exception e) {
            log.warn("没有启用的MQ插件，跳过验证码消息发送", e);
            return false;
        }

        try {
            plugin.sendToQueue(QueueConstant.VERIFICATION_CODE_QUEUE, message);
            return true;
        } catch (Exception e) {
            log.error("发送验证码消息到MQ失败，插件 {}", plugin, e);
            return false;
        }
    }
}
