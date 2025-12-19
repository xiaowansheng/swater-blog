package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("log_error")
public class LogError extends BaseEntity {
    @TableField("user_id")
    private Long userId;

    private String username;

    @TableField("exception_type")
    private String exceptionType;

    @TableField("exception_msg")
    private String exceptionMsg;

    @TableField("stack_trace")
    private String stackTrace;

    private String method;

    private String path;

    private String params;

    private String ip;

    @TableField("ip_address")
    private String ipAddress;

    private String version;

    @TableField("request_url")
    private String requestUrl;

    @TableField("request_method")
    private String requestMethod;

    @TableField("request_param")
    private String requestParam;

    private String module;

    @TableField("calling_method")
    private String callingMethod;

    @TableField("error_name")
    private String errorName;

    @TableField("error_message")
    private String errorMessage;

    @TableField("ip_source")
    private String ipSource;

    private String device;

    private String browser;
}

