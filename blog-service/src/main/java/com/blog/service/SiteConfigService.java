package com.blog.service;

import com.blog.model.dto.config.*;

import java.util.Map;

/**
 * 网站配置服务
 */
public interface SiteConfigService {
    
    // ========== 获取配置（返回对象） ==========
    
    SiteConfigDTO getSiteConfig();
    
    AuthorConfigDTO getAuthorConfig();
    
    CoverConfigDTO getCoverConfig();
    
    SocialConfigDTO getSocialConfig();
    
    PrivacyConfigDTO getPrivacyConfig();
    
    CommentConfigDTO getCommentConfig();
    
    NotifyConfigDTO getNotifyConfig();
    
    UploadConfigDTO getUploadConfig();
    
    EmailConfigDTO getEmailConfig();
    
    // ========== 更新配置 ==========
    
    void updateSiteConfig(SiteConfigDTO config);
    
    void updateAuthorConfig(AuthorConfigDTO config);
    
    void updateCoverConfig(CoverConfigDTO config);
    
    void updateSocialConfig(SocialConfigDTO config);
    
    void updatePrivacyConfig(PrivacyConfigDTO config);
    
    void updateCommentConfig(CommentConfigDTO config);
    
    void updateNotifyConfig(NotifyConfigDTO config);
    
    void updateUploadConfig(UploadConfigDTO config);
    
    void updateEmailConfig(EmailConfigDTO config);
    
    // ========== 前台公开接口 ==========
    
    /**
     * 获取前台所需的所有配置（过滤敏感信息）
     */
    Map<String, Object> getPublicConfig();
}
