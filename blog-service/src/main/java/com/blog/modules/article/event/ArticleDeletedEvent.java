package com.blog.modules.article.event;


import com.blog.common.model.event.BaseEvent;
public class ArticleDeletedEvent extends BaseEvent {
    private final Long articleId;

    public ArticleDeletedEvent(Object source, Long articleId) {
        super(source, "ARTICLE_DELETED");
        this.articleId = articleId;
    }

    public Long getArticleId() {
        return articleId;
    }
}

