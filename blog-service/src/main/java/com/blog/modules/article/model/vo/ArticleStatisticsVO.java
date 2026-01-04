package com.blog.modules.article.model.vo;


import lombok.Data;
@Data
public class ArticleStatisticsVO {
    private Long totalCount;

    private Long publishedCount;

    private Long draftCount;

    private Long totalViewCount;

    private Long totalLikeCount;

    private Long totalCommentCount;
}

