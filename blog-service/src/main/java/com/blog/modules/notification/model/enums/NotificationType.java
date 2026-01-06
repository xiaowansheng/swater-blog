package com.blog.modules.notification.model.enums;

import lombok.Getter;

/**
 * 通知类型枚举
 */
@Getter
public enum NotificationType {
    // 用户相关
    USER_LOGIN("USER_LOGIN", "用户登录"),
    USER_REGISTER("USER_REGISTER", "用户注册"),
    PASSWORD_RESET("PASSWORD_RESET", "密码重置"),

    // 评论相关
    COMMENT("COMMENT", "新评论"),
    COMMENT_REPLY("COMMENT_REPLY", "评论回复"),
    COMMENT_APPROVED("COMMENT_APPROVED", "评论审核通过"),

    // 留言相关
    GUESTBOOK("GUESTBOOK", "留言"),

    // 其他
    SYSTEM("SYSTEM", "系统通知");

    private final String code;
    private final String description;

    NotificationType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public static NotificationType fromCode(String code) {
        if (code == null) {
            return SYSTEM;
        }
        for (NotificationType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return SYSTEM;
    }
}
