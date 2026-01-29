package com.blog.infrastructure.revalidate;

import com.blog.modules.article.event.*;
import com.blog.modules.talk.event.talk.*;
import com.blog.modules.talk.model.enums.TalkStatus;
import com.blog.modules.article.model.enums.ArticleStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class RevalidateEventListener {

    private static final List<String> ARTICLE_TAGS = List.of(
            "article:list",
            "article:latest",
            "article:hot",
            "article:detail"
    );

    private static final List<String> MOMENT_TAGS = List.of(
            "moment:list",
            "moment:detail"
    );

    @Autowired(required = false)
    private RevalidateClient revalidateClient;

    private void revalidate(List<String> tags) {
        if (revalidateClient == null) {
            return;
        }
        revalidateClient.revalidateTags(tags);
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleCreated(ArticleCreatedEvent event) {
        if (event.getArticle() != null && ArticleStatus.PUBLISHED.getCode().equals(event.getArticle().getStatus())) {
            revalidate(ARTICLE_TAGS);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUpdated(ArticleUpdatedEvent event) {
        if (event.getArticle() != null) {
            revalidate(ARTICLE_TAGS);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleDeleted(ArticleDeletedEvent event) {
        revalidate(ARTICLE_TAGS);
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticlePublished(ArticlePublishedEvent event) {
        revalidate(ARTICLE_TAGS);
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleArticleUnpublished(ArticleUnpublishedEvent event) {
        revalidate(ARTICLE_TAGS);
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkCreated(TalkCreatedEvent event) {
        if (event.getTalk() != null && TalkStatus.PUBLISHED.getCode().equals(event.getTalk().getStatus())) {
            revalidate(MOMENT_TAGS);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkUpdated(TalkUpdatedEvent event) {
        if (event.getTalk() != null) {
            revalidate(MOMENT_TAGS);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleTalkDeleted(TalkDeletedEvent event) {
        revalidate(MOMENT_TAGS);
    }
}
