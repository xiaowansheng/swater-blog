package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("archive")
public class Archive extends BaseEntity {
    private Integer year;

    private Integer month;

    @TableField("post_count")
    private Integer postCount;
}

