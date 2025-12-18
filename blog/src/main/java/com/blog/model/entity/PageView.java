package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("page_view")
public class PageView extends BaseEntity {
    private Long count;

    @TableField("view_type")
    private String viewType;

    @TableField("view_id")
    private Long viewId;
}

