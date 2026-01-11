package com.blog.modules.statistics.track.model.entity;


import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("visitor_session")
public class VisitorSession extends com.blog.shared.model.entity.BaseEntity {
    @TableField("visitor_id")
    private Long visitorId;

    @TableField("session_id")
    private String sessionId;

    @TableField("started_at")
    private LocalDateTime startedAt;

    @TableField("last_activity_at")
    private LocalDateTime lastActivityAt;

    @TableField("entry_page_key")
    private String entryPageKey;

    @TableField("entry_referer")
    private String entryReferer;

    @TableField("utm_source")
    private String utmSource;

    @TableField("utm_medium")
    private String utmMedium;

    @TableField("utm_campaign")
    private String utmCampaign;
}

