package com.blog.modules.system.config.model.dto.config;




import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.system.config.model.dto.config.NotifyConfigDTO;
import lombok.Data;
/**
 * 通知设置配置（仅后台使用）
 */
@Data
public class NotifyConfigDTO {
    private Boolean loginEmail = false;
    private Boolean commentEmail = true;
    private Boolean replyEmail = true;
    private Boolean guestbookEmail = true;
    private Boolean friendLinkEmail = true;
}
