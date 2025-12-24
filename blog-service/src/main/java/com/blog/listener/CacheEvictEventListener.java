package com.blog.listener;

import com.blog.event.article.*;
import com.blog.event.talk.*;
import com.blog.event.user.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CacheEvictEventListener {

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUpdated(ArticleUpdatedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleDeleted(ArticleDeletedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticlePublished(ArticlePublishedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUnpublished(ArticleUnpublishedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkUpdated(TalkUpdatedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkDeleted(TalkDeletedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserUpdated(UserUpdatedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserDeleted(UserDeletedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserPasswordReset(UserPasswordResetEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserRolesAssigned(UserRolesAssignedEvent event) {
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleUserLoggedOut(UserLoggedOutEvent event) {
    }
}

