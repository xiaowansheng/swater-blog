package com.blog.modules.search.listener;


import com.blog.modules.article.event.*;
import com.blog.modules.comment.event.*;
import com.blog.modules.talk.event.talk.*;
import com.blog.modules.search.service.SearchSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
@Slf4j
@Component
public class SearchSyncEventListener {

    @Autowired(required = false)
    private SearchSyncService searchSyncService;

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleCreated(ArticleCreatedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            if (event.getArticle().getStatus() != null && event.getArticle().getStatus() == 1) {
                searchSyncService.syncPost(event.getArticleId());
            }
        } catch (Exception e) {
            log.error("同步文章ES索引失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUpdated(ArticleUpdatedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            if (event.getArticle().getStatus() != null && event.getArticle().getStatus() == 1) {
                searchSyncService.syncPost(event.getArticleId());
            } else {
                searchSyncService.deletePost(event.getArticleId());
            }
        } catch (Exception e) {
            log.error("同步文章ES索引失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleDeleted(ArticleDeletedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            searchSyncService.deletePost(event.getArticleId());
        } catch (Exception e) {
            log.error("删除文章ES索引失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticlePublished(ArticlePublishedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            searchSyncService.syncPost(event.getArticleId());
        } catch (Exception e) {
            log.error("同步文章ES索引失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUnpublished(ArticleUnpublishedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            searchSyncService.deletePost(event.getArticleId());
        } catch (Exception e) {
            log.error("删除文章ES索引失败，文章ID: {}", event.getArticleId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkCreated(TalkCreatedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            if ("1".equals(event.getTalk().getStatus())) {
                searchSyncService.syncMoment(event.getTalkId());
            }
        } catch (Exception e) {
            log.error("同步说说ES索引失败，说说ID: {}", event.getTalkId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkUpdated(TalkUpdatedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            if ("1".equals(event.getTalk().getStatus())) {
                searchSyncService.syncMoment(event.getTalkId());
            } else {
                searchSyncService.deleteMoment(event.getTalkId());
            }
        } catch (Exception e) {
            log.error("同步说说ES索引失败，说说ID: {}", event.getTalkId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkDeleted(TalkDeletedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            searchSyncService.deleteMoment(event.getTalkId());
        } catch (Exception e) {
            log.error("删除说说ES索引失败，说说ID: {}", event.getTalkId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            if (event.getComment().getStatus() != null && event.getComment().getStatus() == 1) {
                searchSyncService.syncComment(event.getCommentId());
            }
        } catch (Exception e) {
            log.error("同步评论ES索引失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentUpdated(CommentUpdatedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            if (event.getComment().getStatus() != null && event.getComment().getStatus() == 1) {
                searchSyncService.syncComment(event.getCommentId());
            } else {
                searchSyncService.deleteComment(event.getCommentId());
            }
        } catch (Exception e) {
            log.error("同步评论ES索引失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentDeleted(CommentDeletedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            searchSyncService.deleteComment(event.getCommentId());
        } catch (Exception e) {
            log.error("删除评论ES索引失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentApproved(CommentApprovedEvent event) {
        if (searchSyncService == null) {
            return;
        }
        try {
            searchSyncService.syncComment(event.getCommentId());
        } catch (Exception e) {
            log.error("同步评论ES索引失败，评论ID: {}", event.getCommentId(), e);
        }
    }
}

