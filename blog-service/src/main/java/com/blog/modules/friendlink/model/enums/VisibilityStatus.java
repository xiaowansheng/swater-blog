package com.blog.modules.friendlink.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 友链可见状态枚举
 */
@Getter
@AllArgsConstructor
public enum VisibilityStatus {

    HIDDEN(0, "不可见"),
    VISIBLE(1, "可见");

    private final Integer code;
    private final String desc;

    public static VisibilityStatus getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (VisibilityStatus status : values()) {
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
