package com.blog.infrastructure.revalidate;

import com.blog.modules.article.event.*;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.friendlink.event.FriendLinkApprovedEvent;
import com.blog.modules.friendlink.event.FriendLinkCreatedEvent;
import com.blog.modules.talk.event.talk.*;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.talk.model.enums.TalkStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class RevalidateEventListener {

    @Autowired(required = false)
    private RevalidateClient revalidateClient;

    private void revalidate(List<String> tags) {
        if (revalidateClient == null) {
            return;
        }
        revalidateClient.revalidateTags(tags);
    }

    private void revalidateArticleDetail(Long articleId, Article article) {
        if (articleId == null || article == null) {
            return;
        }
        String idTag = "article:detail:id:" + articleId;
        String slug = article.getSlug();
        String key = article.getArticleKey();
        java.util.List<String> tags = new java.util.ArrayList<>();
        tags.add(idTag);
        if (slug != null && !slug.isBlank()) {
            tags.add("article:detail:slug:" + slug);
        }
        if (key != null && !key.isBlank()) {
            tags.add("article:detail:key:" + key);
        }
        revalidate(tags);
    }

    private void revalidateArticleDetailById(Long articleId) {
        if (articleId == null) {
            return;
        }
        revalidate(List.of("article:detail:id:" + articleId));
    }

    private void revalidateMomentDetail(Long talkId, Talk talk) {
        if (talkId == null || talk == null) {
            return;
        }
        String idTag = "moment:detail:id:" + talkId;
        String key = talk.getTalkKey();
        if (key != null && !key.isBlank()) {
            revalidate(List.of(idTag, "moment:detail:key:" + key));
        } else {
            revalidate(List.of(idTag));
        }
    }

    private void revalidateMomentDetailById(Long talkId) {
        if (talkId == null) {
            return;
        }
        revalidate(List.of("moment:detail:id:" + talkId));
    }

    private void revalidateArchiveByArticle(Article article) {
        if (article == null) {
            return;
        }
        java.time.LocalDateTime time = article.getPublishedAt();
        if (time == null) {
            time = article.getCreateTime();
        }
        if (time == null) {
            return;
        }
        String monthTag = "archive:month:" + time.getYear() + "-" + String.format("%02d", time.getMonthValue());
        revalidate(List.of("archive:list", monthTag));
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleCreated(ArticleCreatedEvent event) {
        if (event.getArticle() != null && ArticleStatus.PUBLISHED.getCode().equals(event.getArticle().getStatus())) {
            revalidate(RevalidateTags.ARTICLE_LIST);
            revalidateArticleDetail(event.getArticleId(), event.getArticle());
            revalidateArchiveByArticle(event.getArticle());
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUpdated(ArticleUpdatedEvent event) {
        if (event.getArticle() != null) {
            revalidate(RevalidateTags.ARTICLE_LIST);
            revalidateArticleDetail(event.getArticleId(), event.getArticle());
            revalidateArchiveByArticle(event.getArticle());
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleDeleted(ArticleDeletedEvent event) {
        revalidate(RevalidateTags.ARTICLE_LIST);
        revalidateArticleDetailById(event.getArticleId());
        revalidate(RevalidateTags.ARCHIVE_LIST);
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticlePublished(ArticlePublishedEvent event) {
        revalidate(RevalidateTags.ARTICLE_LIST);
        revalidateArticleDetail(event.getArticleId(), event.getArticle());
        revalidateArchiveByArticle(event.getArticle());
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUnpublished(ArticleUnpublishedEvent event) {
        revalidate(RevalidateTags.ARTICLE_LIST);
        revalidateArticleDetail(event.getArticleId(), event.getArticle());
        revalidateArchiveByArticle(event.getArticle());
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkCreated(TalkCreatedEvent event) {
        if (event.getTalk() != null && TalkStatus.PUBLISHED.getCode().equals(event.getTalk().getStatus())) {
            revalidate(RevalidateTags.MOMENT_LIST);
            revalidateMomentDetail(event.getTalkId(), event.getTalk());
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkUpdated(TalkUpdatedEvent event) {
        if (event.getTalk() != null) {
            revalidate(RevalidateTags.MOMENT_LIST);
            revalidateMomentDetail(event.getTalkId(), event.getTalk());
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkDeleted(TalkDeletedEvent event) {
        revalidate(RevalidateTags.MOMENT_LIST);
        revalidateMomentDetailById(event.getTalkId());
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleFriendLinkCreated(FriendLinkCreatedEvent event) {
        revalidate(RevalidateTags.FRIENDLINK_LIST);
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleFriendLinkApproved(FriendLinkApprovedEvent event) {
        revalidate(RevalidateTags.FRIENDLINK_LIST);
    }
}
