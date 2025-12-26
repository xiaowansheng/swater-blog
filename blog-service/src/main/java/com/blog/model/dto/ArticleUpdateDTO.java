package com.blog.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class ArticleUpdateDTO {
    @NotNull(message = "文章ID不能为空")
    private Long id;

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

    private Integer status;

    private Integer isTop;

    private List<Long> tagIds;
}