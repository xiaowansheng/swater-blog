package com.blog.modules.article.model.dto;

import lombok.Data;

@Data
public class ArticleQueryDTO {
    private Long page;
    private Long size;
    private Long id;
    private String articleKey;
    private Integer status;
    private Long categoryId;
    private String type;
    private Integer isTop;
    private String keyword;
}
