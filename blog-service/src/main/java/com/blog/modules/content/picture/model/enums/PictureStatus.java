package com.blog.modules.content.picture.model.enums;

import lombok.Getter;

/**
 * 图片状态枚举
 */
@Getter
public enum PictureStatus {
    DRAFT("draft", "草稿"),
    PUBLISHED("published", "已发布"),
    PRIVATE("private", "私密");

    private final String code;
    private final String description;

    PictureStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
