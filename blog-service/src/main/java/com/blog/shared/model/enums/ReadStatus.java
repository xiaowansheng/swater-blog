package com.blog.shared.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通用已读状态枚举
 */
@Getter
@AllArgsConstructor
public enum ReadStatus {

    UNREAD(0, "未读"),
    READ(1, "已读");

    private final Integer code;
    private final String description;

    public boolean matches(Integer code) {
        return this.code.equals(code);
    }
}
