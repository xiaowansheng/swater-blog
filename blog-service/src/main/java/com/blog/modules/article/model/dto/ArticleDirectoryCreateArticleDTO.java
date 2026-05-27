package com.blog.modules.article.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ArticleDirectoryCreateArticleDTO {
    @NotBlank(message = "文章标题不能为空")
    private String title;

    private Long parentId;
}
