package com.blog.modules.guestbook.model.dto;

import lombok.Data;

/**
 * 留言查询参数DTO
 */
@Data
public class GuestbookQueryDTO {

    /**
     * 页码
     */
    private Long page;

    /**
     * 每页大小
     */
    private Long size;

    /**
     * 审核状态：0-待审核，1-已通过，2-已拒绝
     */
    private Integer reviewStatus;

    /**
     * 留言ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 邮箱
     */
    private String email;

    /**
     * QQ号
     */
    private String qq;

    /**
     * 可见状态：0-隐藏，1-可见
     */
    private Integer isVisible;

    /**
     * 关键词搜索（留言内容、昵称、邮箱）
     */
    private String keyword;

    /**
     * 国家
     */
    private String country;

    /**
     * 省份
     */
    private String province;

    /**
     * 城市
     */
    private String city;
}
