package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ExceptionLogVO extends BaseVO {
    private Long userId;

    private String username;

    private String exceptionType;

    private String exceptionMsg;

    private String stackTrace;

    private String method;

    private String path;

    private String params;

    private String ip;

    private String ipAddress;

    private String version;

    private String requestUrl;

    private String requestMethod;

    private String requestParam;

    private String module;

    private String callingMethod;

    private String errorName;

    private String errorMessage;

    private String ipSource;

    private String device;

    private String browser;
}

