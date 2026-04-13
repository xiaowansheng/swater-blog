package com.blog.shared.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通用启用状态枚举
 */
@Getter
@AllArgsConstructor
public enum EnableStatus {

    DISABLED(0, "禁用"),
    ENABLED(1, "启用");

    private final Integer code;
    private final String description;

    public boolean matches(Integer code) {
        return this.code.equals(code);
    }
}
