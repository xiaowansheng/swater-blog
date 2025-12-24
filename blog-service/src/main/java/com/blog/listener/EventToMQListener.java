package com.blog.listener;

import com.blog.event.comment.CommentApprovedEvent;
import com.blog.event.comment.CommentCreatedEvent;
import com.blog.event.guestbook.GuestbookApprovedEvent;
import com.blog.event.guestbook.GuestbookCreatedEvent;
import com.blog.event.user.UserCreatedEvent;
import com.blog.event.user.UserLoggedInEvent;
import com.blog.event.user.UserRolesAssignedEvent;
import com.blog.mapper.ArticleMapper;
import com.blog.model.entity.Article;
import com.blog.model.message.NotificationMessage;
import com.blog.model.vo.UserVO;
import com.blog.service.MQService;
import com.blog.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class EventToMQListener {
    
    @Autowired(required = false)
    private MQService mqService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        if (mqService == null) {
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
            if (author == null) {
                return;
            }
            
            String commenterName = "游客";
            if (comment.getNickname() != null && !comment.getNickname().isEmpty()) {
                commenterName = comment.getNickname();
            } else if (comment.getUserId() != null) {
                UserVO commenter = userService.getById(comment.getUserId());
                if (commenter != null) {
                    commenterName = commenter.getNickname() != null && !commenter.getNickname().isEmpty() 
                        ? commenter.getNickname() : commenter.getUsername();
                }
            }
            
            NotificationMessage message = new NotificationMessage();
            message.setType("comment");
            message.setUserId(author.getId());
            message.setTitle("新评论通知");
            message.setContent(String.format("%s 评论了你的文章《%s》", commenterName, article.getTitle()));
            message.setTimestamp(LocalDateTime.now());
            
            Map<String, Object> data = new HashMap<>();
            data.put("commentId", comment.getId());
            data.put("postId", article.getId());
            data.put("postTitle", article.getTitle());
            data.put("commenterName", commenterName);
            data.put("comment", comment);
            data.put("article", article);
            message.setData(data);
            
            mqService.sendNotification(message);
        } catch (Exception e) {
            log.error("发送评论创建事件到MQ失败，评论ID: {}, 文章ID: {}", 
                event.getCommentId(), event.getComment() != null ? event.getComment().getPostId() : null, e);
        }
    }
    
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentApproved(CommentApprovedEvent event) {
        if (mqService == null) {
            return;
        }
        
        try {
            com.blog.model.entity.Comment comment = event.getComment();
            if (comment == null) {
                return;
            }
            
            Long userId = comment.getUserId();
            if (userId == null) {
                return;
            }
            
            UserVO user = userService.getById(userId);
            if (user == null) {
                return;
            }
            
            NotificationMessage message = new NotificationMessage();
            message.setType("comment");
            message.setUserId(userId);
            message.setTitle("评论审核通过");
            message.setContent("您的评论已通过审核");
            message.setTimestamp(LocalDateTime.now());
            
            Map<String, Object> data = new HashMap<>();
            data.put("commentId", comment.getId());
            data.put("comment", comment);
            if (comment.getPostId() != null) {
                Article article = articleMapper.selectById(comment.getPostId());
                if (article != null) {
                    data.put("article", article);
                }
            }
            message.setData(data);
            
            mqService.sendNotification(message);
        } catch (Exception e) {
            log.error("发送评论审核通过事件到MQ失败，评论ID: {}, 用户ID: {}", 
                event.getCommentId(), event.getComment() != null ? event.getComment().getUserId() : null, e);
        }
    }
    
    @Async("eventTaskExecutor")
    @EventListener
    public void handleGuestbookCreated(GuestbookCreatedEvent event) {
        if (mqService == null) {
            return;
        }
        
        try {
            com.blog.model.entity.Guestbook guestbook = event.getGuestbook();
            if (guestbook == null) {
                return;
            }
            
            NotificationMessage message = new NotificationMessage();
            message.setType("guestbook");
            message.setUserId(null);
            message.setTitle("新留言通知");
            message.setContent("收到了一条新的留言");
            message.setTimestamp(LocalDateTime.now());
            
            Map<String, Object> data = new HashMap<>();
            data.put("guestbookId", guestbook.getId());
            data.put("guestbook", guestbook);
            message.setData(data);
            
            mqService.sendNotification(message);
        } catch (Exception e) {
            log.error("发送留言创建事件到MQ失败，留言ID: {}", event.getGuestbookId(), e);
        }
    }
    
    @Async("eventTaskExecutor")
    @EventListener
    public void handleGuestbookApproved(GuestbookApprovedEvent event) {
        if (mqService == null) {
            return;
        }
        
        try {
            com.blog.model.entity.Guestbook guestbook = event.getGuestbook();
            if (guestbook == null) {
                return;
            }
            
            Long userId = guestbook.getUserId();
            if (userId == null) {
                return;
            }
            
            UserVO user = userService.getById(userId);
            if (user == null) {
                return;
            }
            
            NotificationMessage message = new NotificationMessage();
            message.setType("guestbook");
            message.setUserId(userId);
            message.setTitle("留言审核通过");
            message.setContent("您的留言已通过审核");
            message.setTimestamp(LocalDateTime.now());
            
            Map<String, Object> data = new HashMap<>();
            data.put("guestbookId", guestbook.getId());
            data.put("guestbook", guestbook);
            message.setData(data);
            
            mqService.sendNotification(message);
        } catch (Exception e) {
            log.error("发送留言审核通过事件到MQ失败，留言ID: {}, 用户ID: {}", 
                event.getGuestbookId(), event.getGuestbook() != null ? event.getGuestbook().getUserId() : null, e);
        }
    }
    
    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        if (mqService == null) {
            return;
        }
        
        try {
            com.blog.model.entity.User user = event.getUser();
            if (user == null || user.getEmail() == null || user.getEmail().isEmpty()) {
                return;
            }
            
            UserVO userVO = userService.getById(event.getUserId());
            if (userVO == null) {
                return;
            }
            
            NotificationMessage message = new NotificationMessage();
            message.setType("user");
            message.setUserId(user.getId());
            message.setTitle("欢迎注册");
            message.setContent("欢迎您注册成为我们的用户");
            message.setTimestamp(LocalDateTime.now());
            
            Map<String, Object> data = new HashMap<>();
            data.put("user", userVO);
            message.setData(data);
            
            mqService.sendNotification(message);
        } catch (Exception e) {
            log.error("发送用户创建事件到MQ失败，用户ID: {}, 邮箱: {}", 
                event.getUserId(), event.getUser() != null ? event.getUser().getEmail() : null, e);
        }
    }
    
    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserRolesAssigned(UserRolesAssignedEvent event) {
        if (mqService == null) {
            return;
        }
        
        try {
            UserVO user = userService.getById(event.getUserId());
            if (user == null || user.getEmail() == null || user.getEmail().isEmpty()) {
                return;
            }
            
            NotificationMessage message = new NotificationMessage();
            message.setType("user");
            message.setUserId(user.getId());
            message.setTitle("角色分配通知");
            message.setContent("您的账号已被分配新的角色");
            message.setTimestamp(LocalDateTime.now());
            
            Map<String, Object> data = new HashMap<>();
            data.put("user", user);
            data.put("roleIds", event.getRoleIds());
            message.setData(data);
            
            mqService.sendNotification(message);
        } catch (Exception e) {
            log.error("发送角色分配事件到MQ失败，用户ID: {}, 角色IDs: {}", 
                event.getUserId(), event.getRoleIds(), e);
        }
    }
    
    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserLoggedIn(UserLoggedInEvent event) {
        if (mqService == null) {
            return;
        }
        
        try {
            UserVO user = userService.getById(event.getUserId());
            if (user == null) {
                return;
            }
            
            NotificationMessage message = new NotificationMessage();
            message.setType("login");
            message.setUserId(user.getId());
            message.setTitle("登录通知");
            message.setContent(String.format("你的账号在 %s 登录，IP: %s", LocalDateTime.now(), event.getIp()));
            message.setTimestamp(LocalDateTime.now());
            
            Map<String, Object> data = new HashMap<>();
            data.put("user", user);
            data.put("ip", event.getIp());
            message.setData(data);
            
            mqService.sendNotification(message);
        } catch (Exception e) {
            log.error("发送登录事件到MQ失败，用户ID: {}, IP: {}", event.getUserId(), event.getIp(), e);
        }
    }
}

