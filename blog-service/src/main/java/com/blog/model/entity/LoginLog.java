package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("login_log")
public class LoginLog extends BaseEntity {
    @TableField("user_id")
    private Long userId;

    private String ip;

    @TableField("ip_address")
    private String ipAddress;

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @TableField("location_detail")
    private String locationDetail;

    @TableField("device_info")
    private String deviceInfo;

    private String device;

    private String browser;

    private String location;

    @TableField("ip_source")
    private String ipSource;
}

