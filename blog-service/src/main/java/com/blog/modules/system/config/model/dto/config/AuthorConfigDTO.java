package com.blog.modules.system.config.model.dto.config;

import lombok.Data;

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
     * 作者邮箱
     */
    private String email;

    /**
     * 作者网站
     */
    private String website;

    /**
     * 社交媒体链接
     */
    private String socialLinks;

    public Map<String, Object> toPublicView() {
        // Return a Map with fields matching frontend AuthorInfo interface
        Map<String, Object> publicView = new java.util.LinkedHashMap<>();
        publicView.put("name", this.name);
        publicView.put("avatar", this.avatar);
        publicView.put("signature", this.signature != null ? this.signature : "");
        publicView.put("introduction", this.introduction != null ? this.introduction : "");
        return publicView;
    }
}
