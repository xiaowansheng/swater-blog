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

    // Manual setter methods (Lombok backup)
    public void setName(String name) { this.name = name; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public void setSignature(String signature) { this.signature = signature; }
    public void setIntroduction(String introduction) { this.introduction = introduction; }
    public void setEmail(String email) { this.email = email; }
    public void setWebsite(String website) { this.website = website; }
    public void setSocialLinks(String socialLinks) { this.socialLinks = socialLinks; }

    // Manual getter methods (Lombok backup)
    public String getName() { return name; }
    public String getAvatar() { return avatar; }
    public String getSignature() { return signature; }
    public String getIntroduction() { return introduction; }
    public String getDescription() { return description; }
    public String getEmail() { return email; }
    public String getWebsite() { return website; }
    public String getSocialLinks() { return socialLinks; }

    public Map<String, Object> toPublicView() {
        // Return a Map with fields matching frontend AuthorInfo interface
        Map<String, Object> publicView = new java.util.LinkedHashMap<>();
        publicView.put("name", this.name);
        publicView.put("avatar", this.avatar);
        publicView.put("signature", this.signature != null ? this.signature : "");
        publicView.put("introduction", this.introduction != null ? this.introduction :
                       (this.description != null ? this.description : ""));
        return publicView;
    }
}
