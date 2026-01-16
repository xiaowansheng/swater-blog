package com.blog.modules.comment.model.dto;

import lombok.Data;

/**
 * 评论查询参数DTO
 */
@Data
public class CommentQueryDTO {

    /**
     * 页码
     */
    private Long page;

    /**
     * 每页大小
     */
    private Long size;

    /**
     * 评论状态：0-待审核，1-已通过，2-已拒绝
     */
    private Integer status;

    /**
     * 目标ID（文章ID或说说ID）
     */
    private Long targetId;

    /**
     * 目标类型：ARTICLE-文章，TALK-说说
     */
    private String targetType;

    /**
     * 评论ID
     */
    private Long id;

    /**
     * 父评论ID
     */
    private Long parentId;

    /**
     * 根评论ID
     */
    private Long rootId;

    /**
     * 可见状态：0-隐藏，1-可见
     */
    private Integer isVisible;

    /**
     * 关键词搜索（评论内容、昵称、邮箱）
     */
    private String keyword;

    private String country;

    private String province;

    private String city;

    private String location;
}
