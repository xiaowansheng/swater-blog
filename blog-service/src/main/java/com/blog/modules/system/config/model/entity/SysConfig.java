package com.blog.modules.system.config.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_config")
public class SysConfig extends com.blog.shared.model.entity.BaseEntity {

    private Long id;

    @TableField("config_key")
    private String configKey;

    private String name;

    private String value;

    private String type;

    private String description;

    @TableField("group_name")
    private String groupName;

    private Integer sort;
}

