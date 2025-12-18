package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("friend_link")
public class FriendLink extends BaseEntity {
    private String name;

    private String url;

    private String logo;

    private String description;

    private String author;

    private Integer status;

    @TableField("is_visible")
    private Integer isVisible;

    @TableField("review_status")
    private Integer reviewStatus;

    private Integer sort;

    @TableField("user_id")
    private Long userId;
}

