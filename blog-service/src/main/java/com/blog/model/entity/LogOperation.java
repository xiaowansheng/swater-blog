package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("log_operation")
public class LogOperation extends BaseEntity {
    @TableField("user_id")
    private Long userId;

    private String username;

    private String operation;

    private String method;

    private String path;

    private String params;

    private String result;

    @TableField("ip_address")
    private String ipAddress;

    private Long duration;

    private Integer status;

    @TableField("error_msg")
    private String errorMsg;

    private String version;

    private String module;

    @TableField("calling_method")
    private String callingMethod;

    private String type;

    private String description;

    @TableField("request_url")
    private String requestUrl;

    @TableField("request_method")
    private String requestMethod;

    @TableField("request_param")
    private String requestParam;

    @TableField("response_data")
    private String responseData;

    @TableField("elapsed_time")
    private Long elapsedTime;

    private String device;

    private String browser;

    @TableField("ip_source")
    private String ipSource;
}

