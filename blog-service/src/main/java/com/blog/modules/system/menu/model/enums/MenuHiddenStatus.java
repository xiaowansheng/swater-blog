package com.blog.modules.system.menu.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 菜单隐藏状态枚举
 */
@Getter
@AllArgsConstructor
public enum MenuHiddenStatus {

    VISIBLE(0, "显示"),
    HIDDEN(1, "隐藏");

    private final Integer code;
    private final String description;

    public boolean matches(Integer code) {
        return this.code.equals(code);
    }
}
