package com.blog.modules.system.log.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class LogOperationVO extends com.blog.shared.model.vo.BaseVO {
    private Long userId;

    private String username;

    private String operation;

    private String method;

    private String path;

    private String params;

    private String result;

    private String ip;

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

