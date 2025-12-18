package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class LogOperationVO extends BaseVO {
    private Long userId;

    private String username;

    private String operation;

    private String method;

    private String path;

    private String params;

    private String result;

    private String ip;

    private String ipAddress;

    private Long duration;

    private Integer status;

    private String errorMsg;

    private String version;

    private String module;

    private String callingMethod;

    private String type;

    private String description;

    private String requestUrl;

    private String requestMethod;

    private String requestParam;

    private String responseData;

    private Long elapsedTime;

    private String device;

    private String browser;

    private String ipSource;
}

