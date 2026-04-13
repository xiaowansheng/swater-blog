package com.blog.modules.guestbook.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 留言审核状态枚举
 */
@Getter
@AllArgsConstructor
public enum GuestbookReviewStatus {

    PENDING(0, "待审核"),
    APPROVED(1, "已通过"),
    REJECTED(-1, "已拒绝");

    private final Integer code;
    private final String description;

    public static GuestbookReviewStatus fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (GuestbookReviewStatus status : values()) {
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
