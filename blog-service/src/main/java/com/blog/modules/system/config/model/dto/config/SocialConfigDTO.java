package com.blog.modules.system.config.model.dto.config;




import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.system.config.model.dto.config.SocialConfigDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 社交链接配置
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SocialConfigDTO {
    private String github;
    private String gitee;
    private String weibo;
    private String zhihu;
    private String bilibili;
    private String twitter;
    private String facebook;
}
