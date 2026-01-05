package com.blog.modules.statistics.visitor.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@EqualsAndHashCode(callSuper = true)
public class VisitorVO extends com.blog.shared.model.vo.BaseVO {
    private String visitorUuid;

    private String ip;

    private String country;

    private String province;

    private String city;

    private String district;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private String isp;

    private String timezone;

    private String deviceType;

    private String deviceBrand;

    private String deviceModel;

    private String osName;

    private String osVersion;

    private String browserName;

    private String browserVersion;

    private String refererUrl;

    private String trafficSource;

    private String searchEngine;

    private String searchKeywords;

    private String utmSource;

    private String utmMedium;

    private String utmCampaign;

    private Integer visitCount;

    private LocalDateTime firstVisitTime;

    private LocalDateTime lastVisitTime;

    private String status;
}

