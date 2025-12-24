package com.blog.event.article;

import com.blog.event.BaseEvent;
import com.blog.model.entity.Article;

public class ArticleCreatedEvent extends BaseEvent {
    private final Long articleId;
    private final Article article;

    public ArticleCreatedEvent(Object source, Long articleId, Article article) {
        super(source, "ARTICLE_CREATED");
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

