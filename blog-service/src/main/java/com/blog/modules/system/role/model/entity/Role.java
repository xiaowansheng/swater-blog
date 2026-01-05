package com.blog.modules.system.role.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("role")
public class Role extends com.blog.shared.model.entity.BaseEntity {
    private String name;

    private String code;

    @TableField("role_key")
    private String roleKey;

    private String description;

    private Integer status;

    private Integer disabled;
}

