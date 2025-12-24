package com.blog.listener;

import com.blog.event.comment.CommentApprovedEvent;
import com.blog.event.comment.CommentCreatedEvent;
import com.blog.event.guestbook.GuestbookApprovedEvent;
import com.blog.event.guestbook.GuestbookCreatedEvent;
import com.blog.event.user.UserCreatedEvent;
import com.blog.event.user.UserLoggedInEvent;
import com.blog.event.user.UserRolesAssignedEvent;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.RoleMapper;
import com.blog.mapper.UserMapper;
import com.blog.mapper.UserRoleMapper;
import com.blog.model.entity.Article;
import com.blog.model.entity.Role;
import com.blog.model.entity.User;
import com.blog.model.entity.UserRole;
import com.blog.model.vo.UserVO;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.email.EmailProviderPlugin;
import com.blog.service.UserService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class NotificationEventListener {

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

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        if (emailProviderPlugin == null || (emailProviderPlugin instanceof Plugin && !((Plugin) emailProviderPlugin).isEnabled())) {
            return;
        }

        try {
            com.blog.model.entity.Comment comment = event.getComment();
            if (comment == null || comment.getPostId() == null) {
                return;
            }

            Article article = articleMapper.selectById(comment.getPostId());
            if (article == null || article.getAuthorId() == null) {
                return;
            }

            UserVO author = userService.getById(article.getAuthorId());
            if (author == null || author.getEmail() == null || author.getEmail().isEmpty()) {
                return;
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("title", "新评论通知");
            variables.put("content", "您的文章《" + article.getTitle() + "》收到了一条新评论");
            variables.put("user", author);
            variables.put("article", article);
            variables.put("comment", comment);

            emailProviderPlugin.sendEmailWithTemplate(
                    author.getEmail(),
                    "新评论通知",
                    "notification_comment_created",
                    variables
            );

            log.info("评论创建通知邮件已发送，收件人: {}", author.getEmail());
        } catch (Exception e) {
            log.error("发送评论创建通知邮件失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentApproved(CommentApprovedEvent event) {
        if (emailProviderPlugin == null || (emailProviderPlugin instanceof Plugin && !((Plugin) emailProviderPlugin).isEnabled())) {
            return;
        }

        try {
            com.blog.model.entity.Comment comment = event.getComment();
            if (comment == null) {
                return;
            }

            String email = comment.getEmail();
            if (email == null || email.isEmpty()) {
                if (comment.getUserId() != null) {
                    UserVO user = userService.getById(comment.getUserId());
                    if (user != null && user.getEmail() != null && !user.getEmail().isEmpty()) {
                        email = user.getEmail();
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            }

            Article article = null;
            if (comment.getPostId() != null) {
                article = articleMapper.selectById(comment.getPostId());
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("title", "评论审核通过");
            variables.put("content", "您的评论已通过审核");
            variables.put("comment", comment);
            if (article != null) {
                variables.put("article", article);
            }

            emailProviderPlugin.sendEmailWithTemplate(
                    email,
                    "评论审核通过",
                    "notification_comment_approved",
                    variables
            );

            log.info("评论审核通过通知邮件已发送，收件人: {}", email);
        } catch (Exception e) {
            log.error("发送评论审核通过通知邮件失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleGuestbookCreated(GuestbookCreatedEvent event) {
        if (emailProviderPlugin == null || (emailProviderPlugin instanceof Plugin && !((Plugin) emailProviderPlugin).isEnabled())) {
            return;
        }

        try {
            List<User> adminUsers = getAdminUsers();
            if (adminUsers.isEmpty()) {
                return;
            }

            com.blog.model.entity.Guestbook guestbook = event.getGuestbook();
            if (guestbook == null) {
                return;
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("title", "新留言通知");
            variables.put("content", "收到了一条新的留言");
            variables.put("guestbook", guestbook);

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
                    log.info("留言创建通知邮件已发送，收件人: {}", admin.getEmail());
                } catch (Exception e) {
                    log.error("发送留言创建通知邮件失败，收件人: {}", admin.getEmail(), e);
                }
            }
        } catch (Exception e) {
            log.error("发送留言创建通知邮件失败，留言ID: {}", event.getGuestbookId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleGuestbookApproved(GuestbookApprovedEvent event) {
        if (emailProviderPlugin == null || (emailProviderPlugin instanceof Plugin && !((Plugin) emailProviderPlugin).isEnabled())) {
            return;
        }

        try {
            com.blog.model.entity.Guestbook guestbook = event.getGuestbook();
            if (guestbook == null) {
                return;
            }

            String email = guestbook.getEmail();
            if (email == null || email.isEmpty()) {
                if (guestbook.getUserId() != null) {
                    UserVO user = userService.getById(guestbook.getUserId());
                    if (user != null && user.getEmail() != null && !user.getEmail().isEmpty()) {
                        email = user.getEmail();
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("title", "留言审核通过");
            variables.put("content", "您的留言已通过审核");
            variables.put("guestbook", guestbook);

            emailProviderPlugin.sendEmailWithTemplate(
                    email,
                    "留言审核通过",
                    "notification_guestbook_approved",
                    variables
            );

            log.info("留言审核通过通知邮件已发送，收件人: {}", email);
        } catch (Exception e) {
            log.error("发送留言审核通过通知邮件失败，留言ID: {}", event.getGuestbookId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        if (emailProviderPlugin == null || (emailProviderPlugin instanceof Plugin && !((Plugin) emailProviderPlugin).isEnabled())) {
            return;
        }

        try {
            User user = event.getUser();
            if (user == null || user.getEmail() == null || user.getEmail().isEmpty()) {
                return;
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("title", "欢迎注册");
            variables.put("content", "欢迎您注册成为我们的用户");
            variables.put("user", user);

            emailProviderPlugin.sendEmailWithTemplate(
                    user.getEmail(),
                    "欢迎注册",
                    "notification_user_created",
                    variables
            );

            log.info("用户创建通知邮件已发送，收件人: {}", user.getEmail());
        } catch (Exception e) {
            log.error("发送用户创建通知邮件失败，用户ID: {}", event.getUserId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserRolesAssigned(UserRolesAssignedEvent event) {
        if (emailProviderPlugin == null || (emailProviderPlugin instanceof Plugin && !((Plugin) emailProviderPlugin).isEnabled())) {
            return;
        }

        try {
            UserVO user = userService.getById(event.getUserId());
            if (user == null || user.getEmail() == null || user.getEmail().isEmpty()) {
                return;
            }

            List<Long> roleIds = event.getRoleIds();
            if (roleIds == null || roleIds.isEmpty()) {
                return;
            }

            List<Role> roles = roleMapper.selectBatchIds(roleIds);
            List<String> roleNames = roles.stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            Map<String, Object> variables = new HashMap<>();
            variables.put("title", "角色分配通知");
            variables.put("content", "您的账号已被分配新的角色");
            variables.put("user", user);
            variables.put("roles", roleNames);

            emailProviderPlugin.sendEmailWithTemplate(
                    user.getEmail(),
                    "角色分配通知",
                    "notification_user_roles_assigned",
                    variables
            );

            log.info("角色分配通知邮件已发送，收件人: {}", user.getEmail());
        } catch (Exception e) {
            log.error("发送角色分配通知邮件失败，用户ID: {}", event.getUserId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserLoggedIn(UserLoggedInEvent event) {
        if (emailProviderPlugin == null || (emailProviderPlugin instanceof Plugin && !((Plugin) emailProviderPlugin).isEnabled())) {
            return;
        }

        try {
            UserVO user = userService.getById(event.getUserId());
            if (user == null || user.getEmail() == null || user.getEmail().isEmpty()) {
                return;
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("title", "登录通知");
            variables.put("content", "您的账号进行了登录操作");
            variables.put("user", user);
            variables.put("ip", event.getIp());

            emailProviderPlugin.sendEmailWithTemplate(
                    user.getEmail(),
                    "登录通知",
                    "notification_login",
                    variables
            );

            log.info("登录通知邮件已发送，收件人: {}", user.getEmail());
        } catch (Exception e) {
            log.error("发送登录通知邮件失败，用户ID: {}", event.getUserId(), e);
        }
    }

    private List<User> getAdminUsers() {
        LambdaQueryWrapper<Role> roleWrapper = new LambdaQueryWrapper<>();
        roleWrapper.eq(Role::getCode, "admin").eq(Role::getDeleted, 0);
        Role adminRole = roleMapper.selectOne(roleWrapper);
        if (adminRole == null) {
            return List.of();
        }

        LambdaQueryWrapper<UserRole> userRoleWrapper = new LambdaQueryWrapper<>();
        userRoleWrapper.eq(UserRole::getRoleId, adminRole.getId());
        List<UserRole> userRoles = userRoleMapper.selectList(userRoleWrapper);
        if (userRoles.isEmpty()) {
            return List.of();
        }

        List<Long> adminUserIds = userRoles.stream()
                .map(UserRole::getUserId)
                .collect(Collectors.toList());

        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.in(User::getId, adminUserIds)
                .eq(User::getDeleted, 0)
                .eq(User::getStatus, 1);
        return userMapper.selectList(userWrapper);
    }
}

