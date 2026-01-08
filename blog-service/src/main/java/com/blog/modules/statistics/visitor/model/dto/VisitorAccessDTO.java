package com.blog.modules.statistics.visitor.model.dto;


import lombok.Data;
@Data
public class VisitorAccessDTO {
    private String visitorUuid;

    private String ip;
    private String userAgent;

    private String pageType;

    private String pageId;

    private String pageUrl;

    private String referer;

    private String sessionId;

    private String deviceType;

    private String deviceBrand;

    private String deviceModel;

    private String browser;

    private String browserVersion;

    private String os;

    private String osVersion;

    private String trafficSource;

    private String searchEngine;

    private String searchKeywords;

    private String utmSource;

    private String utmMedium;

    private String utmCampaign;
}
