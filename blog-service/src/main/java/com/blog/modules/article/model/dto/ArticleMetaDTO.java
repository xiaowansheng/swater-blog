package com.blog.modules.article.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 文章元数据更新DTO - 仅用于更新属性，不包含内容
 */
@Data
public class ArticleMetaDTO {
    /**
     * 文章标题
     */
    private String title;

    /**
     * 文章别名
     */
    private String slug;

    /**
     * 文章摘要
     */
    private String excerpt;

    /**
     * 封面图片
     */
    private String cover;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 分类名称（新建分类时使用）
     */
    private String categoryName;

    /**
     * 文章类型：1-原创，2-转载，3-翻译，4-引用
     */
    private String type;

    /**
     * 原文作者
     */
    private String originalAuthor;

    /**
     * 原文标题
     */
    private String originalTitle;

    /**
     * 原文链接
     */
    private String originalUrl;

    /**
     * 备注
     */
    private String note;

    /**
     * 状态：0-草稿，1-已发布，2-私密
     */
    private Integer status;

    /**
     * 是否置顶
     */
    private Integer isTop;

    /**
     * 文章标签ID列表
     */
    private List<Long> tagIds;

    /**
     * 文章标签名称列表（用于新建标签）
     */
    private List<String> tagNames;

    /**
     * 文章Key
     */
    private String articleKey;
}
