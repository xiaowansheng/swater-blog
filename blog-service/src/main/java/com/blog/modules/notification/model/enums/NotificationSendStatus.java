package com.blog.modules.notification.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通知发送状态枚举
 */
@Getter
@AllArgsConstructor
public enum NotificationSendStatus {

    PENDING("PENDING", "待处理"),
    QUEUED("QUEUED", "已入队"),
    SENT("SENT", "已发送"),
    FAILED("FAILED", "失败");

    private final String code;
    private final String description;

    public boolean matches(String code) {
        return this.code.equals(code);
    }
}
