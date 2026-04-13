package com.blog.modules.comment.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 评论审核状态枚举
 */
@Getter
@AllArgsConstructor
public enum CommentStatus {

    PENDING(0, "待审核"),
    APPROVED(1, "已通过"),
    REJECTED(2, "已拒绝");

    private final Integer code;
    private final String description;

    public static CommentStatus fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (CommentStatus status : values()) {
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
