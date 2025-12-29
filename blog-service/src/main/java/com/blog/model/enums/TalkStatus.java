package com.blog.model.enums;

import lombok.Getter;

/**
 * 说说状态枚举
 */
@Getter
public enum TalkStatus {
    DRAFT("0", "草稿"),
    PUBLISHED("1", "已发布");

    private final String code;
    private final String description;

    TalkStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
