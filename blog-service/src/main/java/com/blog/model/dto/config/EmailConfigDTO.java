package com.blog.model.dto.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 邮件设置配置（仅后台使用，包含敏感信息）
 */
@Data
public class EmailConfigDTO {
    private Boolean enable = false;
    private String host = "smtp.qq.com";
    private Integer port = 465;
    private String username;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;  // 密码不返回给前端
    
    private String fromName;
}
