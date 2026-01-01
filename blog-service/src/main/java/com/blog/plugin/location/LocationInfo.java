package com.blog.plugin.location;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LocationInfo {
    private String country;
    private String province;
    private String city;
    private String district;
    private String location;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String isp;
    private String timezone;
    private String ipAddress;
    private String device;
    private String browser;
}
