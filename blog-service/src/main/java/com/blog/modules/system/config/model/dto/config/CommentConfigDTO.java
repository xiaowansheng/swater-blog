package com.blog.modules.system.config.model.dto.config;

import lombok.Data;

/**
 * 评论配置DTO
 */
@Data
public class CommentConfigDTO {
    /**
     * 是否启用评论
     */
    private Boolean enabled;
    
    /**
     * 是否需要审核
     */
    private Boolean needApproval;
    
    /**
     * 是否允许匿名评论
     */
    private Boolean allowAnonymous;
    
    /**
     * 评论最大长度
     */
    private Integer maxLength;
    
    /**
     * 是否启用邮件通知
     */
    private Boolean emailNotification;
    
    /**
     * 敏感词过滤
     */
    private String sensitiveWords;
    
    // Manual setter methods (Lombok backup)
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public void setNeedApproval(Boolean needApproval) { this.needApproval = needApproval; }
    public void setAllowAnonymous(Boolean allowAnonymous) { this.allowAnonymous = allowAnonymous; }
    public void setMaxLength(Integer maxLength) { this.maxLength = maxLength; }
    public void setEmailNotification(Boolean emailNotification) { this.emailNotification = emailNotification; }
    public void setSensitiveWords(String sensitiveWords) { this.sensitiveWords = sensitiveWords; }
    
    // Manual getter methods (Lombok backup)
    public Boolean getEnabled() { return enabled; }
    public Boolean getNeedApproval() { return needApproval; }
    public Boolean getAllowAnonymous() { return allowAnonymous; }
    public Integer getMaxLength() { return maxLength; }
    public Boolean getEmailNotification() { return emailNotification; }
    public String getSensitiveWords() { return sensitiveWords; }
    
    public CommentConfigDTO toPublicView() {
        // Return a copy with only public fields
        CommentConfigDTO publicView = new CommentConfigDTO();
        publicView.setEnabled(this.enabled);
        publicView.setNeedApproval(this.needApproval);
        publicView.setAllowAnonymous(this.allowAnonymous);
        publicView.setMaxLength(this.maxLength);
        return publicView;
    }
}
