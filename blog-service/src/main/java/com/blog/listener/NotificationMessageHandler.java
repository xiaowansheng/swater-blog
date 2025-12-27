package com.blog.listener;

import com.blog.mapper.ArticleMapper;
import com.blog.mapper.RoleMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.entity.Article;
import com.blog.model.entity.Role;
import com.blog.model.entity.User;
import com.blog.model.message.NotificationMessage;
import com.blog.model.vo.UserVO;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.email.EmailProviderPlugin;
import com.blog.plugin.notification.NotificationChannelFactory;
import com.blog.plugin.notification.NotificationChannelPlugin;
import com.blog.service.NotificationService;
import com.blog.service.UserService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class NotificationMessageHandler {
    
    @Autowired(required = false)
    private EmailProviderPlugin emailProviderPlugin;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RoleMapper roleMapper;
    
    @Autowired(required = false)
    private NotificationService notificationService;
    
    @Autowired(required = false)
    private NotificationChannelFactory channelFactory;
    
    @Async("eventTaskExecutor")
    public void handle(NotificationMessage message) {
        if (message == null) {
            return;
        }
        
        try {
            String type = message.getType();
            Long userId = message.getUserId();
            
            if (userId != null && notificationService != null) {
                try {
                    notificationService.sendNotification(userId, type, message.getTitle(), message.getContent());
                } catch (Exception e) {
                    log.error("发送通知到数据库失败", e);
                }
            }
            
            if (channelFactory != null && userId != null) {
                try {
                    List<NotificationChannelPlugin> channels = channelFactory.getEnabledChannels();
                    for (NotificationChannelPlugin channel : channels) {
                        try {
                            channel.send(userId, type, message.getTitle(), message.getContent());
                        } catch (Exception e) {
                            log.error("通知渠道 {} 发送失败", channel.getName(), e);
                        }
                    }
                } catch (Exception e) {
                    log.error("发送WebSocket通知失败", e);
                }
            }
            
            if (emailProviderPlugin != null && (emailProviderPlugin instanceof Plugin && ((Plugin) emailProviderPlugin).isEnabled())) {
                handleEmailNotification(message);
            }
        } catch (Exception e) {
            log.error("处理通知消息失败", e);
        }
    }
    
    private void handleEmailNotification(NotificationMessage message) {
        try {
            String type = message.getType();
            Long userId = message.getUserId();
            Map<String, Object> data = message.getData();
            
            if (userId == null) {
                if ("guestbook".equals(type)) {
                    handleGuestbookCreatedEmail(data);
                }
                return;
            }
            
            UserVO user = userService.getById(userId);
            if (user == null || user.getEmail() == null || user.getEmail().isEmpty()) {
                return;
            }
            
            Map<String, Object> variables = new HashMap<>();
            variables.put("title", message.getTitle());
            variables.put("content", message.getContent());
            variables.put("user", user);
            
            switch (type) {
                case "comment":
                    handleCommentEmail(user, data, variables);
                    break;
                case "guestbook":
                    handleGuestbookEmail(user, data, variables);
                    break;
                case "user":
                    handleUserEmail(user, data, variables, message.getTitle());
                    break;
                case "login":
                    handleLoginEmail(user, data, variables, message.getTitle());
                    break;
            }
        } catch (Exception e) {
            log.error("发送邮件通知失败", e);
        }
    }
    
    private void handleCommentEmail(UserVO user, Map<String, Object> data, Map<String, Object> variables) throws Exception {
        if (data != null && data.containsKey("comment")) {
            variables.put("comment", data.get("comment"));
            if (data.containsKey("article")) {
                variables.put("article", data.get("article"));
                Article article = (Article) data.get("article");
                if (article != null) {
                    variables.put("content", "您的文章《" + article.getTitle() + "》收到了一条新评论");
                }
            }
            emailProviderPlugin.sendEmailWithTemplate(
                    user.getEmail(),
                    "新评论通知",
                    "notification_comment_created",
                    variables
            );
        } else if (data != null && data.containsKey("commentId")) {
            variables.put("comment", data.get("comment"));
            if (data.containsKey("article")) {
                variables.put("article", data.get("article"));
            }
            emailProviderPlugin.sendEmailWithTemplate(
                    user.getEmail(),
                    "评论审核通过",
                    "notification_comment_approved",
                    variables
            );
        }
    }
    
    private void handleGuestbookEmail(UserVO user, Map<String, Object> data, Map<String, Object> variables) throws Exception {
        if (data != null && data.containsKey("guestbook")) {
            variables.put("guestbook", data.get("guestbook"));
            emailProviderPlugin.sendEmailWithTemplate(
                    user.getEmail(),
                    "留言审核通过",
                    "notification_guestbook_approved",
                    variables
            );
        }
    }
    
    private void handleGuestbookCreatedEmail(Map<String, Object> data) throws Exception {
        List<User> adminUsers = getAdminUsers();
        if (adminUsers.isEmpty()) {
            return;
        }
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("title", "新留言通知");
        variables.put("content", "收到了一条新的留言");
        if (data != null && data.containsKey("guestbook")) {
            variables.put("guestbook", data.get("guestbook"));
        }
        
        for (User admin : adminUsers) {
            if (admin.getEmail() == null || admin.getEmail().isEmpty()) {
                continue;
            }
            
            try {
                variables.put("user", admin);
                emailProviderPlugin.sendEmailWithTemplate(
                        admin.getEmail(),
                        "新留言通知",
                        "notification_guestbook_created",
                        variables
                );
            } catch (Exception e) {
                log.error("发送留言创建通知邮件失败，收件人: {}", admin.getEmail(), e);
            }
        }
    }
    
    private void handleUserEmail(UserVO user, Map<String, Object> data, Map<String, Object> variables, String title) throws Exception {
        if (data != null && data.containsKey("roleIds")) {
            @SuppressWarnings("unchecked")
            List<Long> roleIds = (List<Long>) data.get("roleIds");
            if (roleIds != null && !roleIds.isEmpty()) {
                List<Role> roles = roleMapper.selectBatchIds(roleIds);
                if (roles != null) {
                    List<String> roleNames = roles.stream()
                            .map(Role::getName)
                            .collect(Collectors.toList());
                    variables.put("roles", roleNames);
                }
            }
            emailProviderPlugin.sendEmailWithTemplate(
                    user.getEmail(),
                    "角色分配通知",
                    "notification_user_roles_assigned",
                    variables
            );
        } else {
            emailProviderPlugin.sendEmailWithTemplate(
                    user.getEmail(),
                    "欢迎注册",
                    "notification_user_created",
                    variables
            );
        }
    }
    
    private void handleLoginEmail(UserVO user, Map<String, Object> data, Map<String, Object> variables, String title) throws Exception {
        if (data != null && data.containsKey("ip")) {
            variables.put("ip", data.get("ip"));
        }
        emailProviderPlugin.sendEmailWithTemplate(
                user.getEmail(),
                title,
                "notification_login",
                variables
        );
    }
    
    private List<User> getAdminUsers() {
        LambdaQueryWrapper<Role> roleWrapper = new LambdaQueryWrapper<>();
        roleWrapper.eq(Role::getCode, "admin").eq(Role::getDeleted, 0);
        Role adminRole = roleMapper.selectOne(roleWrapper);
        if (adminRole == null) {
            return List.of();
        }
        
        // 直接根据角色名称查找用户
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getRole, adminRole.getRoleKey())
                .eq(User::getDeleted, 0)
                .eq(User::getStatus, 1);
        return userMapper.selectList(userWrapper);
    }
}

