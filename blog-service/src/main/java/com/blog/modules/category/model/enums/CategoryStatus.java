package com.blog.modules.category.model.enums;

import lombok.Getter;

/**
 * 分类状态枚举
 */
@Getter
public enum CategoryStatus {
    DRAFT("draft", "草稿"),
    PUBLISHED("published", "已发布"),
    PRIVATE("private", "私密");

    private final String code;
    private final String description;

    CategoryStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
