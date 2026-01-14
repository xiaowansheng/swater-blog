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
public class LogOperation extends com.blog.shared.model.entity.BaseEntity {
    @TableField("user_id")
    private Long userId;

    private String username;

    private String operation;

    private String ip;

    @TableField("elapsed_time")
    private Long elapsedTime;

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
    private String requestUri;

    @TableField("request_method")
    private String requestMethod;

    @TableField("request_param")
    private String requestParams;

    @TableField("response_data")
    private String responseData;

    private String device;

    private String browser;

    @TableField("ip_source")
    private String ipSource;
}

