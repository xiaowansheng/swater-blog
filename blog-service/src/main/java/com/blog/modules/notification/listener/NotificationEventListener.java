package com.blog.modules.notification.listener;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.comment.event.CommentApprovedEvent;
import com.blog.modules.comment.event.CommentCreatedEvent;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.comment.model.enums.TargetType;
import com.blog.modules.friendlink.event.FriendLinkCreatedEvent;
import com.blog.modules.friendlink.event.FriendLinkApprovedEvent;
import com.blog.modules.guestbook.event.GuestbookCreatedEvent;
import com.blog.modules.notification.model.enums.NotificationType;
import com.blog.modules.notification.service.NotificationService;
import com.blog.modules.system.config.service.SiteConfigService;
import com.blog.modules.system.config.model.dto.config.NotifyConfigDTO;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.user.event.user.UserLoggedInEvent;
import com.blog.modules.user.event.UserCreatedEvent;
import com.blog.modules.user.event.UserPasswordResetEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 通知事件监听器
 * 监听系统中的各种事件，根据配置发送通知
 */
@Slf4j
@Component
public class NotificationEventListener {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired(required = false)
    private CommentMapper commentMapper;

    @Autowired(required = false)
    private ArticleMapper articleMapper;

    @Autowired(required = false)
    private TalkMapper talkMapper;

    /**
     * 用户登录事件
     * 当用户登录时，根据配置发送邮件通知管理员
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserLoggedIn(UserLoggedInEvent event) {
        try {
            NotifyConfigDTO notifyConfig = siteConfigService.getNotifyConfig();
            if (notifyConfig == null || notifyConfig.getLoginNotify() == null || !notifyConfig.getLoginNotify()) {
                log.debug("登录通知未启用，跳过发送");
                return;
            }

            Long userId = event.getUserId();
            String ip = event.getIp();

            String title = "用户登录通知";
            String content = String.format("用户ID: %d 于IP地址: %s 登录了系统", userId, ip);

            // 发送通知给管理员（userId=1通常是超级管理员）
            notificationService.sendNotification(1L, NotificationType.USER_LOGIN.getCode(), title, content);

            log.info("用户登录通知已发送，用户ID: {}, IP: {}", userId, ip);
        } catch (Exception e) {
            log.error("发送登录通知失败，用户ID: {}", event.getUserId(), e);
        }
    }

    /**
     * 用户注册事件
     * 当新用户注册时，发送欢迎通知
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        try {
            Long userId = event.getUserId();
            String username = event.getUser().getUsername();
            String email = event.getUser().getEmail();

            String title = "欢迎加入";
            String content = String.format("亲爱的 %s，欢迎注册成为本站会员！如有任何问题，请随时联系我们。", username);

            // 发送欢迎通知给新用户
            notificationService.sendNotification(userId, NotificationType.USER_REGISTER.getCode(), title, content);

            // 同时通知管理员有新用户注册
            String adminTitle = "新用户注册通知";
            String adminContent = String.format("新用户 %s (%s) 已注册成为会员", username, email);
            notificationService.sendNotification(1L, NotificationType.USER_REGISTER.getCode(), adminTitle, adminContent);

            log.info("用户注册通知已发送，用户ID: {}, 用户名: {}", userId, username);
        } catch (Exception e) {
            log.error("发送注册通知失败，用户ID: {}", event.getUserId(), e);
        }
    }

    /**
     * 密码重置事件
     * 当用户重置密码时，发送安全通知
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserPasswordReset(UserPasswordResetEvent event) {
        try {
            Long userId = event.getUserId();

            String title = "密码已重置";
            String content = "您的密码已被成功重置。如果这不是您本人的操作，请立即联系管理员。";

            // 发送密码重置通知给用户
            notificationService.sendNotification(userId, NotificationType.PASSWORD_RESET.getCode(), title, content);

            log.info("密码重置通知已发送，用户ID: {}", userId);
        } catch (Exception e) {
            log.error("发送密码重置通知失败，用户ID: {}", event.getUserId(), e);
        }
    }

    /**
     * 评论创建事件
     * 当有新评论时，通知文章/说说作者
     * 如果是回复评论，还会通知被回复的用户
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        try {
            NotifyConfigDTO notifyConfig = siteConfigService.getNotifyConfig();
            if (notifyConfig == null || notifyConfig.getCommentNotify() == null || !notifyConfig.getCommentNotify()) {
                log.debug("评论通知未启用，跳过发送");
                return;
            }

            var comment = event.getComment();
            Long userId = comment.getUserId();
            String content = comment.getContent();
            String nickname = comment.getNickname();
            String targetTypeStr = comment.getTargetType();
            Long targetId = comment.getTargetId();
            Long parentId = comment.getParentId();

            // 1. 如果是回复评论，通知被回复的用户
            if (parentId != null && parentId > 0 && commentMapper != null) {
                boolean replyEnabled = notifyConfig.getReplyNotify() != null && notifyConfig.getReplyNotify();
                if (replyEnabled) {
                    try {
                        // 查询父评论获取被回复用户的ID
                        Comment parentComment = commentMapper.selectById(parentId);
                        if (parentComment != null && parentComment.getUserId() != null) {
                            Long parentUserId = parentComment.getUserId();

                            // 不通知自己
                            if (!parentUserId.equals(userId)) {
                                String replyTitle = "收到新回复";
                                String replyContent = String.format("用户 %s 回复了您的评论：\n%s", nickname, content);

                                notificationService.sendNotification(parentUserId, NotificationType.COMMENT_REPLY.getCode(), replyTitle, replyContent);

                                log.info("回复评论通知已发送，被回复用户ID: {}, 父评论ID: {}", parentUserId, parentId);
                            }
                        }
                    } catch (Exception e) {
                        log.error("发送回复通知失败，评论ID: {}", event.getCommentId(), e);
                    }
                }
            }

            // 2. 通知文章/说说作者
            Long authorId = null;
            TargetType targetType = TargetType.fromCode(targetTypeStr);
            try {
                if (TargetType.ARTICLE.equals(targetType) && articleMapper != null) {
                    Article article = articleMapper.selectById(targetId);
                    if (article != null) {
                        authorId = article.getAuthorId();
                    }
                } else if (TargetType.TALK.equals(targetType) && talkMapper != null) {
                    Talk talk = talkMapper.selectById(targetId);
                    if (talk != null) {
                        authorId = talk.getAuthorId();
                    }
                }
            } catch (Exception e) {
                log.error("查询作者ID失败，目标类型: {}, 目标ID: {}", targetTypeStr, targetId, e);
            }

            // 如果找到作者ID，且评论者不是作者本人，则发送通知
            if (authorId != null && !authorId.equals(userId)) {
                String title = "收到新评论";
                String notificationContent = String.format("您的文章/说说收到了一条新评论：\n%s", content);

                // 发送通知给作者
                notificationService.sendNotification(authorId, NotificationType.COMMENT.getCode(), title, notificationContent);

                log.info("评论通知已发送，作者ID: {}, 目标类型: {}, 目标ID: {}", authorId, targetType != null ? targetType.getDescription() : targetTypeStr, targetId);
            }
        } catch (Exception e) {
            log.error("发送评论通知失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    /**
     * 评论审核通过事件
     * 当评论被审核通过时，通知评论者
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentApproved(CommentApprovedEvent event) {
        try {
            var comment = event.getComment();
            Long userId = comment.getUserId();

            String title = "评论审核通过";
            String content = "您发表的评论已通过审核并展示";

            // 发送通知给评论者
            notificationService.sendNotification(userId, NotificationType.COMMENT_APPROVED.getCode(), title, content);

            log.info("评论审核通过通知已发送，用户ID: {}", userId);
        } catch (Exception e) {
            log.error("发送评论审核通知失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    /**
     * 留言创建事件
     * 当有新留言时，通知管理员
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleGuestbookCreated(GuestbookCreatedEvent event) {
        try {
            NotifyConfigDTO notifyConfig = siteConfigService.getNotifyConfig();
            if (notifyConfig == null || notifyConfig.getGuestbookNotify() == null || !notifyConfig.getGuestbookNotify()) {
                log.debug("留言通知未启用，跳过发送");
                return;
            }

            var guestbook = event.getGuestbook();
            String nickname = guestbook.getNickname();
            String content = guestbook.getContent();

            String title = "收到新留言";
            String notificationContent = String.format("访客 %s 在留言板留下了新消息：\n%s", nickname, content);

            // 发送通知给管理员
            notificationService.sendNotification(1L, NotificationType.GUESTBOOK.getCode(), title, notificationContent);

            log.info("留言通知已发送，访客: {}", nickname);
        } catch (Exception e) {
            log.error("发送留言通知失败，留言ID: {}", event.getGuestbookId(), e);
        }
    }

    /**
     * 友链申请事件
     * 当有新友链申请时，通知管理员
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleFriendLinkCreated(FriendLinkCreatedEvent event) {
        try {
            NotifyConfigDTO notifyConfig = siteConfigService.getNotifyConfig();
            if (notifyConfig == null || notifyConfig.getFriendLinkNotify() == null || !notifyConfig.getFriendLinkNotify()) {
                log.debug("友链申请通知未启用，跳过发送");
                return;
            }

            var friendLink = event.getFriendLink();
            String name = friendLink.getName();
            String url = friendLink.getUrl();
            String author = friendLink.getAuthor();

            String title = "收到新的友链申请";
            String content = String.format("收到来自 %s 的友链申请：\n网站名称：%s\n网站地址：%s", author != null ? author : "访客", name, url);

            // 发送通知给管理员
            notificationService.sendNotification(1L, NotificationType.FRIEND_LINK.getCode(), title, content);

            log.info("友链申请通知已发送，网站名称: {}, URL: {}", name, url);
        } catch (Exception e) {
            log.error("发送友链申请通知失败，友链ID: {}", event.getFriendLinkId(), e);
        }
    }

    /**
     * 友链审核通过事件
     * 当友链申请被审核通过时，通知申请人
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleFriendLinkApproved(FriendLinkApprovedEvent event) {
        try {
            var friendLink = event.getFriendLink();
            Long userId = friendLink.getUserId();
            String name = friendLink.getName();

            String title = "友链申请已通过";
            String content = String.format("您申请的友链（%s）已通过审核并展示在网站上", name);

            // 发送通知给申请人（如果有用户ID）
            if (userId != null && userId > 0) {
                notificationService.sendNotification(userId, NotificationType.FRIEND_LINK_APPROVED.getCode(), title, content);
                log.info("友链审核通过通知已发送，用户ID: {}, 网站名称: {}", userId, name);
            }
        } catch (Exception e) {
            log.error("发送友链审核通过通知失败，友链ID: {}", event.getFriendLinkId(), e);
        }
    }
}
