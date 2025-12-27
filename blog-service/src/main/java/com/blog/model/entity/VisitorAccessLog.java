package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("visitor_access_log")
public class VisitorAccessLog extends BaseEntity {
    @TableField("visitor_id")
    private Long visitorId;

    @TableField("visitor_uuid")
    private String visitorUuid;

    @TableField("ip_address")
    private String ipAddress;

    @TableField("page_type")
    private String pageType;

    @TableField("page_id")
    private String pageId;

    @TableField("page_url")
    private String pageUrl;

    private String referer;

    @TableField("session_id")
    private String sessionId;

    @TableField("is_new_visitor")
    private Integer isNewVisitor;

    @TableField("access_time")
    private LocalDateTime accessTime;

    @TableField("traffic_source")
    private String trafficSource;

    @TableField("referer_url")
    private String refererUrl;

    @TableField("search_engine")
    private String searchEngine;

    @TableField("search_keywords")
    private String searchKeywords;

    @TableField("utm_source")
    private String utmSource;

    @TableField("utm_medium")
    private String utmMedium;

    @TableField("utm_campaign")
    private String utmCampaign;
}

