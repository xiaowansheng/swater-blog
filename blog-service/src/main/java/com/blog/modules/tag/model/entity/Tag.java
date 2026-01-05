package com.blog.modules.tag.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("tag")
public class Tag extends com.blog.shared.model.entity.BaseEntity {
    @TableField("tag_key")
    private String tagKey;

    private String name;

    private String slug;

    private String color;

    private String description;

    private String status;
}

