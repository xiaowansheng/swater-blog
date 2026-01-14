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

    private String ip;

    private Long elapsedTime;

    private Integer status;

    private String errorMsg;

    private String version;

    private String module;

    private String callingMethod;

    private String type;

    private String description;

    private String requestUri;

    private String requestMethod;

    private String requestParams;

    private String responseData;

    private String device;

    private String browser;

    private String ipSource;
}

