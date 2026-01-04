package com.blog.modules.article.model.enums;


import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
/**
 * 文章状态枚举
 */
@Getter
public enum ArticleStatus {
    DRAFT(0, "草稿"),
    PUBLISHED(1, "已发布"),
    PRIVATE(2, "私密");

    @EnumValue
    @JsonValue
    private final Integer code;
    private final String description;

    ArticleStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public static ArticleStatus fromCode(Integer code) {
        if (code == null) return DRAFT;
        for (ArticleStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return DRAFT;
    }

    /**
     * 判断是否为公开可见状态
     */
    public boolean isPublic() {
        return this == PUBLISHED;
    }
}
