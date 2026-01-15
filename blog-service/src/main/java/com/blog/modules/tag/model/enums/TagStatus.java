package com.blog.modules.tag.model.enums;

import lombok.Getter;

/**
 * 标签状态枚举
 */
@Getter
public enum TagStatus {
    DRAFT("draft", "草稿"),
    PUBLISHED("published", "已发布"),
    PRIVATE("private", "私密");

    private final String code;
    private final String description;

    TagStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
