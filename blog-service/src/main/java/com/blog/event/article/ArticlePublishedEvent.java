package com.blog.event.article;

import com.blog.event.BaseEvent;
import com.blog.model.entity.Article;

public class ArticlePublishedEvent extends BaseEvent {
    private final Long articleId;
    private final Article article;

    public ArticlePublishedEvent(Object source, Long articleId, Article article) {
        super(source, "ARTICLE_PUBLISHED");
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

