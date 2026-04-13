package com.blog.shared.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通用禁用标记枚举
 */
@Getter
@AllArgsConstructor
public enum DisabledFlag {

    NO(0, "否"),
    YES(1, "是");

    private final Integer code;
    private final String description;

    public boolean matches(Integer code) {
        return this.code.equals(code);
    }
}
