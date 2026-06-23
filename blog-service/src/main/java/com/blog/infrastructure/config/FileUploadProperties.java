package com.blog.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * 文件上传安全配置，绑定 application.yml 中 security.file-upload。
 */
@ConfigurationProperties(prefix = "security.file-upload")
public class FileUploadProperties {

    /** 单文件最大尺寸（Spring 风格字符串，如 50MB） */
    private String maxSize = "50MB";

    /** 允许上传的扩展名白名单；为空表示不启用白名单 */
    private List<String> allowedExtensions = new ArrayList<>();

    /** 禁止上传的扩展名黑名单；命中即拒绝 */
    private List<String> blockedExtensions = new ArrayList<>();

    public String getMaxSize() {
        return maxSize;
    }

    public void setMaxSize(String maxSize) {
        this.maxSize = maxSize;
    }

    public List<String> getAllowedExtensions() {
        return allowedExtensions;
    }

    public void setAllowedExtensions(List<String> allowedExtensions) {
        this.allowedExtensions = allowedExtensions;
    }

    public List<String> getBlockedExtensions() {
        return blockedExtensions;
    }

    public void setBlockedExtensions(List<String> blockedExtensions) {
        this.blockedExtensions = blockedExtensions;
    }
}
