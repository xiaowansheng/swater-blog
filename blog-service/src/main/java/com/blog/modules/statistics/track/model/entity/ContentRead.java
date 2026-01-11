package com.blog.modules.statistics.track.model.entity;


import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("content_read")
public class ContentRead extends com.blog.shared.model.entity.BaseEntity {
    @TableField("visitor_id")
    private Long visitorId;

    @TableField("content_type")
    private String contentType;

    @TableField("content_id")
    private Long contentId;

    @TableField("last_counted_at")
    private LocalDateTime lastCountedAt;
}

