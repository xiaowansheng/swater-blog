package com.blog.modules.guestbook.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 留言可见状态枚举
 */
@Getter
@AllArgsConstructor
public enum GuestbookVisibilityStatus {

    HIDDEN(0, "隐藏"),
    VISIBLE(1, "可见");

    private final Integer code;
    private final String description;

    public static GuestbookVisibilityStatus fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (GuestbookVisibilityStatus status : values()) {
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
