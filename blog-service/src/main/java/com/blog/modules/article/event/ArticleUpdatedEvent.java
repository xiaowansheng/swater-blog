package com.blog.modules.article.event;


import com.blog.common.model.event.BaseEvent;
import com.blog.modules.article.model.entity.Article;
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

