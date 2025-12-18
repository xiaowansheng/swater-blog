package com.blog.model.dto;

import lombok.Data;

@Data
public class VisitorAccessDTO {
    private String visitorUuid;

    private String ip;

    private String pageType;

    private String pageId;

    private String pageUrl;

    private String referer;

    private String sessionId;

    private String deviceInfo;

    private String browser;

    private String os;
}

