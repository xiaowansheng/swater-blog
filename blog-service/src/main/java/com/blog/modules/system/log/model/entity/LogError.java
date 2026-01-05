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
@TableName("log_error")
public class LogError extends com.blog.shared.model.entity.BaseEntity {
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

    // Manual setter methods (Lombok backup)
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setExceptionType(String exceptionType) { this.exceptionType = exceptionType; }
    public void setExceptionMsg(String exceptionMsg) { this.exceptionMsg = exceptionMsg; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
    public void setMethod(String method) { this.method = method; }
    public void setPath(String path) { this.path = path; }
    public void setParams(String params) { this.params = params; }
    public void setIp(String ip) { this.ip = ip; }
    public void setVersion(String version) { this.version = version; }
    public void setRequestUrl(String requestUrl) { this.requestUrl = requestUrl; }
    public void setRequestMethod(String requestMethod) { this.requestMethod = requestMethod; }
    public void setRequestParam(String requestParam) { this.requestParam = requestParam; }
    public void setModule(String module) { this.module = module; }
    public void setCallingMethod(String callingMethod) { this.callingMethod = callingMethod; }
    public void setErrorName(String errorName) { this.errorName = errorName; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public void setIpSource(String ipSource) { this.ipSource = ipSource; }
    public void setDevice(String device) { this.device = device; }
    public void setBrowser(String browser) { this.browser = browser; }


}

