package com.blog.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * 文章保存DTO - 用于自动保存和手动保存
 */
@Data
public class ArticleSaveDTO {
    /**
     * 文章ID（新建时为空）
     */
    private Long id;

    /**
     * 文章标题
     */
    @NotBlank(message = "文章标题不能为空")
    private String title;

    /**
     * 文章别名
     */
    private String slug;

    /**
     * 文章内容
     */
    @NotBlank(message = "文章内容不能为空")
    private String content;

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
     * 标签ID列表
     */
    private List<Long> tagIds;

    /**
     * 标签名称列表（新建标签时使用）
     */
    private List<String> tagNames;

    /**
     * 是否为自动保存
     */
    private Boolean autoSave;

    /**
     * 客户端版本号（用于乐观锁）
     */
    private Long clientVersion;
}
