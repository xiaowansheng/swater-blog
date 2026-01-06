package com.blog.modules.system.config.model.dto.config;

import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.system.config.model.dto.config.NotifyConfigDTO;
import lombok.Data;
/**
 * 通知设置配置（仅后台使用）
 */
@Data
public class NotifyConfigDTO {
    private Boolean loginNotify = false;
    private Boolean commentNotify = true;
    private Boolean replyNotify = true;
    private Boolean guestbookNotify = true;
    private Boolean friendLinkNotify = true;
}
