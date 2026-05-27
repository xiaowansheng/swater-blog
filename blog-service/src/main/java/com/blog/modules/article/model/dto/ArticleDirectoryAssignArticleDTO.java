package com.blog.modules.article.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ArticleDirectoryAssignArticleDTO {
    @NotNull(message = "文章ID不能为空")
    private Long articleId;

    private Long parentId;
}
