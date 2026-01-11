package com.blog.modules.statistics.track.model.entity;


import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("content_metric_event")
public class ContentMetricEvent extends com.blog.shared.model.entity.BaseEntity {
    @TableField("visitor_id")
    private Long visitorId;

    private String metric;

    @TableField("content_type")
    private String contentType;

    @TableField("content_id")
    private Long contentId;

    private Integer delta;

    @TableField("occurred_at")
    private LocalDateTime occurredAt;
}

