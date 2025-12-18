package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("article")
public class Article extends BaseEntity {
    @TableField("article_key")
    private String articleKey;

    private String title;

    private String slug;

    private String content;

    private String excerpt;

    private String cover;

    @TableField("author_id")
    private Long authorId;

    @TableField("category_id")
    private Long categoryId;

    private String type;

    @TableField("original_author")
    private String originalAuthor;

    @TableField("original_title")
    private String originalTitle;

    @TableField("original_url")
    private String originalUrl;

    private String note;

    private Integer status;

    @TableField("is_top")
    private Integer isTop;

    @TableField("view_count")
    private Integer viewCount;

    @TableField("like_count")
    private Integer likeCount;

    @TableField("comment_count")
    private Integer commentCount;

    @TableField("published_at")
    private LocalDateTime publishedAt;
}

