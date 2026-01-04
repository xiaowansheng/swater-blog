package com.blog.modules.system.config.model.dto.config;




import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.system.config.model.dto.config.SiteConfigDTO;
import lombok.Data;
/**
 * 网站信息配置
 */
@Data
public class SiteConfigDTO {
    private String name;
    private String description;
    private String keywords;
    private String logo;
    private String favicon;
    private String createTime;
    private String icp;
    private String police;
    private String copyright;
    private String notice;
}
