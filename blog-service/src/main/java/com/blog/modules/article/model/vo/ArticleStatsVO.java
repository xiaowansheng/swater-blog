package com.blog.modules.article.model.vo;

import lombok.Data;

/**
 * 文章统计 VO：批量/单篇读取浏览、点赞、评论数（只读，不产生自增副作用）。
 */
@Data
public class ArticleStatsVO {
    private Long id;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
}
