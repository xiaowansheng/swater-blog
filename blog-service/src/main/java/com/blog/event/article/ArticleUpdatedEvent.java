package com.blog.event.article;

import com.blog.event.BaseEvent;
import com.blog.model.entity.Article;

public class ArticleUpdatedEvent extends BaseEvent {
    private final Long articleId;
    private final Article article;

    public ArticleUpdatedEvent(Object source, Long articleId, Article article) {
        super(source, "ARTICLE_UPDATED");
        this.articleId = articleId;
        this.article = article;
    }

    public Long getArticleId() {
        return articleId;
    }

    public Article getArticle() {
        return article;
    }
}

