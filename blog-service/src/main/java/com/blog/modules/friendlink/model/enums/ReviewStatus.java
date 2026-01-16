package com.blog.modules.friendlink.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 友链审核状态枚举
 */
@Getter
@AllArgsConstructor
public enum ReviewStatus {

    /**
     * 待审核
     */
    PENDING(0, "待审核"),

    /**
     * 已审核
     */
    APPROVED(1, "已审核"),

    /**
     * 已拒绝
     */
    REJECTED(2, "已拒绝");

    private final Integer code;
    private final String desc;

    /**
     * 根据code获取枚举
     */
    public static ReviewStatus getByCode(Integer code) {
        if (code == null) {
            return PENDING;
        }
        for (ReviewStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return PENDING;
    }

    /**
     * 判断是否已审核
     */
    public boolean isApproved() {
        return this == APPROVED;
    }

    /**
     * 判断是否待审核
     */
    public boolean isPending() {
        return this == PENDING;
    }

    /**
     * 判断是否已拒绝
     */
    public boolean isRejected() {
        return this == REJECTED;
    }
}
