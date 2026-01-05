package com.blog.modules.album.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("album")
public class Album extends com.blog.shared.model.entity.BaseEntity {
    @TableField("album_key")
    private String albumKey;

    @TableField("user_id")
    private Long userId;

    private String name;

    private String description;

    private String cover;

    private String status;
}

