package com.blog.shared.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 操作结果状态枚举
 */
@Getter
@AllArgsConstructor
public enum OperationResultStatus {

    FAILED(0, "失败"),
    SUCCESS(1, "成功");

    private final Integer code;
    private final String description;

    public boolean matches(Integer code) {
        return this.code.equals(code);
    }
}
