package com.blog.plugin.notification.impl;

import com.blog.plugin.core.Plugin;
import com.blog.plugin.email.EmailProviderFactory;
import com.blog.plugin.email.EmailProviderPlugin;
import com.blog.plugin.notification.NotificationChannelPlugin;
import com.blog.mapper.UserMapper;
import com.blog.model.entity.User;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@ConditionalOnProperty(name = "notification.email.enabled", havingValue = "true")
public class EmailChannelPlugin implements NotificationChannelPlugin, Plugin {
    
    @Autowired
    private EmailProviderFactory emailProviderFactory;
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public String getName() {
        return "email";
    }
    
    @Override
    public boolean isEnabled() {
        EmailProviderPlugin provider = emailProviderFactory.getProvider();
        return provider != null;
    }
    
    @Override
    public void send(Long userId, String type, String title, String content) throws Exception {
        EmailProviderPlugin provider = emailProviderFactory.getProvider();
        if (provider == null) {
            throw new IllegalStateException("邮件服务提供者未配置");
        }
        
        User user = userMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                .eq(User::getId, userId)
                .eq(User::getDeleted, 0));
        if (user == null || user.getEmail() == null || user.getEmail().isEmpty()) {
            log.warn("用户ID {} 未配置邮箱，跳过邮件通知", userId);
            return;
        }
        
        String templateName = "notification_" + type;
        try {
            provider.sendEmailWithTemplate(user.getEmail(), title, templateName, 
                    Map.of("title", title, "content", content, "user", user));
        } catch (Exception e) {
            log.warn("邮件模板 {} 不存在，使用纯文本发送", templateName);
            provider.sendEmail(user.getEmail(), title, content);
        }
    }
}
