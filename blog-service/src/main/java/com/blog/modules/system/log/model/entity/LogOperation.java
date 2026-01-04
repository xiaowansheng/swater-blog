package com.blog.modules.system.log.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;
@Getter
@Setter
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("log_operation")
public class LogOperation extends com.blog.common.model.entity.BaseEntity {
    @TableField("user_id")
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

    // Manual setter methods (Lombok backup)
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setOperation(String operation) { this.operation = operation; }
    public void setMethod(String method) { this.method = method; }
    public void setPath(String path) { this.path = path; }
    public void setParams(String params) { this.params = params; }
    public void setResult(String result) { this.result = result; }
    public void setIp(String ip) { this.ip = ip; }
    public void setDuration(Long duration) { this.duration = duration; }
    public void setStatus(Integer status) { this.status = status; }
    public void setErrorMsg(String errorMsg) { this.errorMsg = errorMsg; }
    public void setVersion(String version) { this.version = version; }
    public void setModule(String module) { this.module = module; }
    public void setCallingMethod(String callingMethod) { this.callingMethod = callingMethod; }
    public void setType(String type) { this.type = type; }
    public void setDescription(String description) { this.description = description; }
    public void setRequestUrl(String requestUrl) { this.requestUrl = requestUrl; }
    public void setRequestMethod(String requestMethod) { this.requestMethod = requestMethod; }
    public void setRequestParam(String requestParam) { this.requestParam = requestParam; }
    public void setResponseData(String responseData) { this.responseData = responseData; }
    public void setElapsedTime(Long elapsedTime) { this.elapsedTime = elapsedTime; }
    public void setDevice(String device) { this.device = device; }
    public void setBrowser(String browser) { this.browser = browser; }
    public void setIpSource(String ipSource) { this.ipSource = ipSource; }


}

