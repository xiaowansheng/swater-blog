package com.blog.modules.system.config.model.dto.config;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * 作者配置DTO
 */
@Data
public class AuthorConfigDTO {
    /**
     * 作者名称
     */
    private String name;

    /**
     * 作者头像
     */
    private String avatar;

    /**
     * 作者个性签名
     */
    private String signature;

    /**
     * 作者简介
     */
    private String introduction;

    /**
     * 联系方式
     */
    private Map<String, ContactMethod> contactMethods;

    /**
     * 社交链接
     */
    private Map<String, ContactMethod> socialLinks;

    /**
     * 联系方式/社交链接内部类
     */
    @Data
    public static class ContactMethod {
        private String value;
        private Boolean visible;

        public ContactMethod() {}

        public ContactMethod(String value, Boolean visible) {
            this.value = value;
            this.visible = visible;
        }
    }

    /**
     * 初始化联系方式和社交链接（防止空指针）
     */
    public AuthorConfigDTO() {
        this.contactMethods = new HashMap<>();
        this.socialLinks = new HashMap<>();
    }

    public Map<String, Object> toPublicView() {
        Map<String, Object> publicView = new java.util.LinkedHashMap<>();
        publicView.put("name", this.name != null ? this.name : "");
        publicView.put("avatar", this.avatar != null ? this.avatar : "");
        publicView.put("signature", this.signature != null ? this.signature : "");
        publicView.put("introduction", this.introduction != null ? this.introduction : "");

        // 添加联系方式（如果显示配置为true且有值）
        if (this.contactMethods != null) {
            this.contactMethods.forEach((key, method) -> {
                if (method.getVisible() != null && method.getVisible()
                        && method.getValue() != null && !method.getValue().isEmpty()) {
                    publicView.put(key, method.getValue());
                }
            });
        }

        // 添加社交媒体链接（如果显示配置为true且有值）
        if (this.socialLinks != null) {
            this.socialLinks.forEach((key, method) -> {
                if (method.getVisible() != null && method.getVisible()
                        && method.getValue() != null && !method.getValue().isEmpty()) {
                    publicView.put(key, method.getValue());
                }
            });
        }

        return publicView;
    }
}
