package com.blog.modules.comment.model.enums;

import lombok.Getter;

/**
 * 评论目标类型枚举
 */
@Getter
public enum TargetType {
    ARTICLE("ARTICLE", "文章"),
    TALK("TALK", "说说");

    private final String code;
    private final String description;

    TargetType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public static TargetType fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (TargetType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public boolean equals(String targetType) {
        if (targetType == null) {
            return false;
        }
        return this.code.equals(targetType);
    }
}
