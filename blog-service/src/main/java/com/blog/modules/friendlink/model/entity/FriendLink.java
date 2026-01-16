package com.blog.modules.friendlink.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("friend_link")
public class FriendLink extends com.blog.shared.model.entity.BaseEntity {

    @TableField("user_id")
    private Long userId;

    private String name;

    private String url;

    private String logo;

    private String description;

    private String author;

    private String email;

    @TableField("is_visible")
    private Integer isVisible;

    @TableField("review_status")
    private Integer reviewStatus;

    private Integer sort;
}

