package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_config")
public class SysConfig extends BaseEntity {

    private Integer id;

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

