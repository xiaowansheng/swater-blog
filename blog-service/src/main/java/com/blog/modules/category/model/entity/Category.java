package com.blog.modules.category.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("category")
public class Category extends com.blog.shared.model.entity.BaseEntity {
    @TableField("category_key")
    private String categoryKey;

    private String name;

    private String slug;

    private String description;

    @TableField("parent_id")
    private Long parentId;

    private Integer sort;

    private String status;

    @TableField(exist = false)
    private Integer articleCount;
}

