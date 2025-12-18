package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("picture")
public class Picture extends BaseEntity {
    @TableField("user_id")
    private Long userId;

    @TableField("album_id")
    private Long albumId;

    private String name;

    private String description;

    private String url;

    private String source;

    private String status;
}

