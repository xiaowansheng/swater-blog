package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArticleDTO extends BaseDTO {
    @NotBlank(message = "文章标题不能为空")
    private String title;

    private String slug;

    @NotBlank(message = "文章内容不能为空")
    private String content;

    private String excerpt;

    private String cover;

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

