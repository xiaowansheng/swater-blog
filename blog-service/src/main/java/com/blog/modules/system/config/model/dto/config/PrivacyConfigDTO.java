package com.blog.modules.system.config.model.dto.config;




import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.system.config.model.dto.config.PrivacyConfigDTO;
import lombok.Data;
/**
 * 隐私设置配置
 */
@Data
public class PrivacyConfigDTO {
    private Boolean showIp = false;
    private Boolean showLocation = true;
    private Boolean showDevice = false;
    private Boolean showBrowser = false;
}
