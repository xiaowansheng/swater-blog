package com.blog.modules.article.event;


import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.article.model.entity.Article;
public class ArticleUnpublishedEvent extends BaseEvent {
    private final Long articleId;
    private final Article article;

    public ArticleUnpublishedEvent(Object source, Long articleId, Article article) {
        super(source, "ARTICLE_UNPUBLISHED");
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

