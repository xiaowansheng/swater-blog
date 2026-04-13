package com.blog.modules.comment.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 评论可见状态枚举
 */
@Getter
@AllArgsConstructor
public enum CommentVisibilityStatus {

    HIDDEN(0, "隐藏"),
    VISIBLE(1, "可见");

    private final Integer code;
    private final String description;

    public static CommentVisibilityStatus fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (CommentVisibilityStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public boolean matches(Integer code) {
        return this.code.equals(code);
    }
}
