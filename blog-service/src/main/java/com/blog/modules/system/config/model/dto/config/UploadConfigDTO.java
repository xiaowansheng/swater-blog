package com.blog.modules.system.config.model.dto.config;




import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.system.config.model.dto.config.UploadConfigDTO;
import lombok.Data;
/**
 * 上传设置配置（仅后台使用）
 *
 * 降级语义：当某字段为 null/空时，运行时回退到 application.yml 中
 * {@code security.file-upload} 的系统默认值（max-size / allowed-extensions / blocked-extensions）。
 * 其中 blocked-extensions（黑名单）始终生效，不受本配置影响。
 */
@Data
public class UploadConfigDTO {
    /**
     * 单文件最大字节数。范围 [1KB, 1GB]。为空时回退到系统默认 maxSize。
     */
    private Long maxSize = 10485760L;  // 默认10MB
    /**
     * 允许的扩展名白名单，逗号分隔（如 "jpg,jpeg,png"）。
     * 为空时回退到系统默认 allowed-extensions。注意：黑名单始终优先生效。
     */
    private String allowedTypes = "jpg,jpeg,png,gif,webp,pdf,doc,docx,zip";
    private Boolean imageCompress = true;
    private Integer imageQuality = 85;
}
