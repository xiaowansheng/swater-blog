package com.blog.modules.article.model.dto;


import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
@Data
public class ArticleCreateDTO {
    @NotBlank(message = "文章标题不能为空")
    private String title;

    private String slug;

    @NotBlank(message = "文章内容不能为空")
    private String content;

    private String excerpt;

    private String cover;

    @NotNull(message = "分类ID不能为空")
    private Long categoryId;

    private String type;

    private String originalAuthor;

    private String originalTitle;

    private String originalUrl;

    private String note;

    private Integer status = 0; // 默认草稿状态

    private Integer isTop = 0; // 默认不置顶

    private List<Long> tagIds;
}