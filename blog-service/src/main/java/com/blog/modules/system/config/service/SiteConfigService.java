package com.blog.modules.system.config.service;

import com.blog.modules.system.config.model.dto.config.EmailConfigDTO;
import com.blog.modules.system.config.model.dto.config.UploadConfigDTO;
import com.blog.modules.system.config.model.dto.config.NotifyConfigDTO;
import com.blog.modules.system.config.model.dto.config.CommentConfigDTO;
import com.blog.modules.system.config.model.dto.config.PrivacyConfigDTO;
import com.blog.modules.system.config.model.dto.config.SocialConfigDTO;
import com.blog.modules.system.config.model.dto.config.CoverConfigDTO;
import com.blog.modules.system.config.model.dto.config.AuthorConfigDTO;
import com.blog.modules.system.config.model.dto.config.SiteConfigDTO;
import com.blog.modules.system.config.model.dto.config.ComponentConfigDTO;
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

    ComponentConfigDTO getComponentConfig();

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

    void updateComponentConfig(ComponentConfigDTO config);

    void updateNotifyConfig(NotifyConfigDTO config);
    
    void updateUploadConfig(UploadConfigDTO config);
    
    void updateEmailConfig(EmailConfigDTO config);
    
    // ========== 前台公开接口 ==========
    
    /**
     * 获取前台所需的所有配置（过滤敏感信息）
     */
    Map<String, Object> getPublicConfig();
}
