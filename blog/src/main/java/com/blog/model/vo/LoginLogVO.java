package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class LoginLogVO extends BaseVO {
    private Long userId;

    private String userName;

    private String userNickname;

    private String ip;

    private String ipAddress;

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String locationDetail;

    private String deviceInfo;

    private String device;

    private String browser;

    private String location;

    private String ipSource;
}

