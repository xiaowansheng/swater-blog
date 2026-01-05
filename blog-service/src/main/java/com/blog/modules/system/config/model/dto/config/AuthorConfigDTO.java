package com.blog.modules.system.config.model.dto.config;

import lombok.Data;

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
     * 作者简介
     */
    private String description;
    
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
    public void setDescription(String description) { this.description = description; }
    public void setEmail(String email) { this.email = email; }
    public void setWebsite(String website) { this.website = website; }
    public void setSocialLinks(String socialLinks) { this.socialLinks = socialLinks; }
    
    // Manual getter methods (Lombok backup)
    public String getName() { return name; }
    public String getAvatar() { return avatar; }
    public String getDescription() { return description; }
    public String getEmail() { return email; }
    public String getWebsite() { return website; }
    public String getSocialLinks() { return socialLinks; }
    
    public AuthorConfigDTO toPublicView() {
        // Return a copy with only public fields
        AuthorConfigDTO publicView = new AuthorConfigDTO();
        publicView.setName(this.name);
        publicView.setAvatar(this.avatar);
        publicView.setDescription(this.description);
        publicView.setWebsite(this.website);
        publicView.setSocialLinks(this.socialLinks);
        return publicView;
    }
}
