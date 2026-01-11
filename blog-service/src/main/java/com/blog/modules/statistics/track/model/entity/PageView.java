package com.blog.modules.statistics.track.model.entity;


import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("page_view")
public class PageView extends com.blog.shared.model.entity.BaseEntity {
    @TableField("visitor_id")
    private Long visitorId;

    @TableField("session_id")
    private String sessionId;

    @TableField("page_key")
    private String pageKey;

    @TableField("page_url")
    private String pageUrl;

    private String referer;

    @TableField("occurred_at")
    private LocalDateTime occurredAt;
}

