package com.blog.modules.system.config.model.dto.config;




import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.system.config.model.dto.config.UploadConfigDTO;
import lombok.Data;
/**
 * 上传设置配置（仅后台使用）
 */
@Data
public class UploadConfigDTO {
    private Long maxSize = 10485760L;  // 默认10MB
    private String allowedTypes = "jpg,jpeg,png,gif,webp,pdf,doc,docx,zip";
    private Boolean imageCompress = true;
    private Integer imageQuality = 85;
}
