package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_menu")
public class SysMenu extends BaseEntity {
    private String key;

    private String title;

    private String icon;

    private String redirect;

    private String path;

    private String component;

    private Integer hidden;

    private Integer sort;

    @TableField("parent_id")
    private Long parentId;

    private String perms;

    private String description;
}

