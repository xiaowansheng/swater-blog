package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class VisitorVO extends BaseVO {
    private String visitorUuid;

    private String ip;

    private String ipAddress;

    private String country;

    private String province;

    private String city;

    private String district;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String locationDetail;

    private String isp;

    private String timezone;

    private String deviceInfo;

    private String deviceType;

    private String deviceBrand;

    private String deviceModel;

    private String os;

    private String osName;

    private String osVersion;

    private String browser;

    private String browserName;

    private String browserVersion;

    private String referer;

    private String refererUrl;

    private String trafficSource;

    private String searchEngine;

    private String searchKeywords;

    private Integer visitCount;

    private LocalDateTime firstVisitTime;

    private LocalDateTime lastVisitTime;

    private String status;
}

