package com.blog.plugin.components.notification.impl;



import com.blog.infrastructure.mail.EmailService;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.notification.NotificationChannelPlugin;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.user.model.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import java.util.Map;
@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.notification.email.active", havingValue = "email", matchIfMissing = false)
public class EmailChannelPlugin implements NotificationChannelPlugin, Plugin {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserMapper userMapper;

    @Override
    public String getName() {
        return "email";
    }

    @Override
    public boolean isEnabled() {
        return emailService.isConfigured();
    }

    @Override
    public void send(Long userId, String type, String title, String content) throws Exception {
        if (!emailService.isConfigured()) {
            throw new IllegalStateException("邮件服务未配置");
        }

        User user = userMapper.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                .eq(User::getId, userId)
                .eq(User::getDeleted, 0));
        if (user == null || user.getEmail() == null || user.getEmail().isEmpty()) {
            log.warn("用户ID {} 未配置邮箱，跳过邮件通知", userId);
            return;
        }

        String templateName = "email/notification_" + type;
        try {
            emailService.sendEmailWithTemplate(user.getEmail(), title, templateName,
                    Map.of("title", title, "content", content, "user", user));
        } catch (Exception e) {
            log.warn("邮件模板 {} 不存在，使用纯文本发送", templateName);
            emailService.sendEmail(user.getEmail(), title, content);
        }
    }
}
