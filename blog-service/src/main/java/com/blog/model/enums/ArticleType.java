package com.blog.model.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

/**
 * 文章类型枚举
 */
@Getter
public enum ArticleType {
    ORIGINAL("1", "原创"),
    REPOST("2", "转载"),
    TRANSLATION("3", "翻译"),
    QUOTE("4", "引用");

    @EnumValue
    @JsonValue
    private final String code;
    private final String description;

    ArticleType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public static ArticleType fromCode(String code) {
        if (code == null) return ORIGINAL;
        for (ArticleType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return ORIGINAL;
    }
}
