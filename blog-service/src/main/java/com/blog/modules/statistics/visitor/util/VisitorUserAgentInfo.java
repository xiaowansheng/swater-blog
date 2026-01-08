package com.blog.modules.statistics.visitor.util;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VisitorUserAgentInfo {
    private String deviceType;
    private String deviceBrand;
    private String deviceModel;
    private String osName;
    private String osVersion;
    private String browserName;
    private String browserVersion;
}

