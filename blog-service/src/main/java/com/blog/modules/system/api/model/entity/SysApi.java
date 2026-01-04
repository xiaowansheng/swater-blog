package com.blog.modules.system.api.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_api")
public class SysApi extends com.blog.common.model.entity.BaseEntity {
    private String apiKey;

    private String name;

    private String path;

    private String method;

    private String description;

    @TableField("parent_id")
    private Long parentId;

    @TableField("is_open")
    private Integer isOpen;

    private String perms;

    private Integer sort;
}

