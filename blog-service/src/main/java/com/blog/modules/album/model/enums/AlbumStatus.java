package com.blog.modules.album.model.enums;

import lombok.Getter;

/**
 * 相册状态枚举
 */
@Getter
public enum AlbumStatus {
    DRAFT("draft", "草稿"),
    PUBLISHED("published", "已发布"),
    PRIVATE("private", "私密");

    private final String code;
    private final String description;

    AlbumStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
