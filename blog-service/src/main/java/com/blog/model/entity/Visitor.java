package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("visitor")
public class Visitor extends BaseEntity {
    @TableField("visitor_uuid")
    private String visitorUuid;

    @TableField("ip_address")
    private String ipAddress;

    private String country;

    private String province;

    private String city;

    private String district;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @TableField("location_detail")
    private String locationDetail;

    private String isp;

    private String timezone;

    @TableField("device_info")
    private String deviceInfo;

    @TableField("device_type")
    private String deviceType;

    @TableField("device_brand")
    private String deviceBrand;

    @TableField("device_model")
    private String deviceModel;

    private String os;

    @TableField("os_name")
    private String osName;

    @TableField("os_version")
    private String osVersion;

    private String browser;

    @TableField("browser_name")
    private String browserName;

    @TableField("browser_version")
    private String browserVersion;

    private String referer;

    @TableField("referer_url")
    private String refererUrl;

    @TableField("traffic_source")
    private String trafficSource;

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

    @TableField("visit_count")
    private Integer visitCount;

    @TableField("first_visit_time")
    private LocalDateTime firstVisitTime;

    @TableField("last_visit_time")
    private LocalDateTime lastVisitTime;

    private String status;
}

