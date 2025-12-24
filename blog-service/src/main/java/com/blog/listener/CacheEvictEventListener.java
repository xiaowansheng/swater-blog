package com.blog.listener;

import com.blog.event.article.*;
import com.blog.event.talk.*;
import com.blog.event.user.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
public class CacheEvictEventListener {

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUpdated(ArticleUpdatedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "article:" + event.getArticleId();
            redisTemplate.delete(key);
            Set<String> keys = redisTemplate.keys("article:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除文章缓存失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleDeleted(ArticleDeletedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "article:" + event.getArticleId();
            redisTemplate.delete(key);
            Set<String> keys = redisTemplate.keys("article:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除文章缓存失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticlePublished(ArticlePublishedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            Set<String> keys = redisTemplate.keys("article:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除文章缓存失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUnpublished(ArticleUnpublishedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "article:" + event.getArticleId();
            redisTemplate.delete(key);
            Set<String> keys = redisTemplate.keys("article:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除文章缓存失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkUpdated(TalkUpdatedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "talk:" + event.getTalkId();
            redisTemplate.delete(key);
            Set<String> keys = redisTemplate.keys("talk:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除说说缓存失败，说说ID: {}", event.getTalkId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkDeleted(TalkDeletedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "talk:" + event.getTalkId();
            redisTemplate.delete(key);
            Set<String> keys = redisTemplate.keys("talk:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除说说缓存失败，说说ID: {}", event.getTalkId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserUpdated(UserUpdatedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "user:" + event.getUserId();
            redisTemplate.delete(key);
            Set<String> keys = redisTemplate.keys("user:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除用户缓存失败，用户ID: {}", event.getUserId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserDeleted(UserDeletedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "user:" + event.getUserId();
            redisTemplate.delete(key);
            Set<String> keys = redisTemplate.keys("user:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除用户缓存失败，用户ID: {}", event.getUserId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserPasswordReset(UserPasswordResetEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "user:" + event.getUserId();
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("清除用户缓存失败，用户ID: {}", event.getUserId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserRolesAssigned(UserRolesAssignedEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "user:" + event.getUserId();
            redisTemplate.delete(key);
            Set<String> keys = redisTemplate.keys("user:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("清除用户缓存失败，用户ID: {}", event.getUserId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserLoggedOut(UserLoggedOutEvent event) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String key = "user:" + event.getUserId();
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("清除用户缓存失败，用户ID: {}", event.getUserId(), e);
        }
    }
}

