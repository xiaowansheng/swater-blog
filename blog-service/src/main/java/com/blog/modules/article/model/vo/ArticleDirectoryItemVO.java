package com.blog.modules.article.model.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class ArticleDirectoryItemVO {
    private String key;

    private String type;

    private Long id;

    private Long parentId;

    private Integer sort;

    private String name;

    private String title;

    private String description;

    private Long articleId;

    private String articleKey;

    private String slug;

    private String cover;

    private Integer status;

    private Long categoryId;

    private String categoryName;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private List<ArticleDirectoryItemVO> children = new ArrayList<>();
}
