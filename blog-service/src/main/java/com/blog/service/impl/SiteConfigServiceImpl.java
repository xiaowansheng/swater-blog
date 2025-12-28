package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.mapper.SysConfigMapper;
import com.blog.model.dto.config.*;
import com.blog.model.entity.SysConfig;
import com.blog.service.SiteConfigService;
import com.blog.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
public class SiteConfigServiceImpl implements SiteConfigService {
    
    @Autowired
    private SysConfigMapper sysConfigMapper;
    
    // 配置key常量
    private static final String KEY_SITE = "site";
    private static final String KEY_AUTHOR = "author";
    private static final String KEY_COVER = "cover";
    private static final String KEY_SOCIAL = "social";
    private static final String KEY_PRIVACY = "privacy";
    private static final String KEY_COMMENT = "comment";
    private static final String KEY_NOTIFY = "notify";
    private static final String KEY_UPLOAD = "upload";
    private static final String KEY_EMAIL = "email";
    
    // ========== 通用方法 ==========
    
    private <T> T getConfig(String key, Class<T> clazz) {
        SysConfig config = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                .eq(SysConfig::getConfigKey, key)
                .eq(SysConfig::getDeleted, 0));
        if (config == null || config.getValue() == null) {
            try {
                return clazz.getDeclaredConstructor().newInstance();
            } catch (Exception e) {
                return null;
            }
        }
        try {
            return JsonUtil.fromJson(config.getValue(), clazz);
        } catch (Exception e) {
            log.error("解析配置失败: key={}, error={}", key, e.getMessage());
            try {
                return clazz.getDeclaredConstructor().newInstance();
            } catch (Exception ex) {
                return null;
            }
        }
    }
    
    @Transactional
    private void updateConfig(String key, Object config) {
        String jsonValue = JsonUtil.toJson(config);
        SysConfig sysConfig = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                .eq(SysConfig::getConfigKey, key)
                .eq(SysConfig::getDeleted, 0));
        if (sysConfig != null) {
            sysConfig.setValue(jsonValue);
            sysConfigMapper.updateById(sysConfig);
        }
    }
    
    // ========== 获取配置 ==========
    
    @Override
    @Cacheable(value = "config", key = "'site'")
    public SiteConfigDTO getSiteConfig() {
        return getConfig(KEY_SITE, SiteConfigDTO.class);
    }
    
    @Override
    @Cacheable(value = "config", key = "'author'")
    public AuthorConfigDTO getAuthorConfig() {
        return getConfig(KEY_AUTHOR, AuthorConfigDTO.class);
    }
    
    @Override
    @Cacheable(value = "config", key = "'cover'")
    public CoverConfigDTO getCoverConfig() {
        return getConfig(KEY_COVER, CoverConfigDTO.class);
    }
    
    @Override
    @Cacheable(value = "config", key = "'social'")
    public SocialConfigDTO getSocialConfig() {
        return getConfig(KEY_SOCIAL, SocialConfigDTO.class);
    }
    
    @Override
    @Cacheable(value = "config", key = "'privacy'")
    public PrivacyConfigDTO getPrivacyConfig() {
        return getConfig(KEY_PRIVACY, PrivacyConfigDTO.class);
    }
    
    @Override
    @Cacheable(value = "config", key = "'comment'")
    public CommentConfigDTO getCommentConfig() {
        return getConfig(KEY_COMMENT, CommentConfigDTO.class);
    }
    
    @Override
    @Cacheable(value = "config", key = "'notify'")
    public NotifyConfigDTO getNotifyConfig() {
        return getConfig(KEY_NOTIFY, NotifyConfigDTO.class);
    }
    
    @Override
    @Cacheable(value = "config", key = "'upload'")
    public UploadConfigDTO getUploadConfig() {
        return getConfig(KEY_UPLOAD, UploadConfigDTO.class);
    }
    
    @Override
    @Cacheable(value = "config", key = "'email'")
    public EmailConfigDTO getEmailConfig() {
        return getConfig(KEY_EMAIL, EmailConfigDTO.class);
    }
    
    // ========== 更新配置 ==========
    
    @Override
    @CacheEvict(value = "config", key = "'site'")
    @Transactional
    public void updateSiteConfig(SiteConfigDTO config) {
        updateConfig(KEY_SITE, config);
    }
    
    @Override
    @CacheEvict(value = "config", key = "'author'")
    @Transactional
    public void updateAuthorConfig(AuthorConfigDTO config) {
        updateConfig(KEY_AUTHOR, config);
    }
    
    @Override
    @CacheEvict(value = "config", key = "'cover'")
    @Transactional
    public void updateCoverConfig(CoverConfigDTO config) {
        updateConfig(KEY_COVER, config);
    }
    
    @Override
    @CacheEvict(value = "config", key = "'social'")
    @Transactional
    public void updateSocialConfig(SocialConfigDTO config) {
        updateConfig(KEY_SOCIAL, config);
    }
    
    @Override
    @CacheEvict(value = "config", key = "'privacy'")
    @Transactional
    public void updatePrivacyConfig(PrivacyConfigDTO config) {
        updateConfig(KEY_PRIVACY, config);
    }
    
    @Override
    @CacheEvict(value = "config", key = "'comment'")
    @Transactional
    public void updateCommentConfig(CommentConfigDTO config) {
        updateConfig(KEY_COMMENT, config);
    }
    
    @Override
    @CacheEvict(value = "config", key = "'notify'")
    @Transactional
    public void updateNotifyConfig(NotifyConfigDTO config) {
        updateConfig(KEY_NOTIFY, config);
    }
    
    @Override
    @CacheEvict(value = "config", key = "'upload'")
    @Transactional
    public void updateUploadConfig(UploadConfigDTO config) {
        updateConfig(KEY_UPLOAD, config);
    }
    
    @Override
    @CacheEvict(value = "config", key = "'email'")
    @Transactional
    public void updateEmailConfig(EmailConfigDTO config) {
        updateConfig(KEY_EMAIL, config);
    }
    
    // ========== 前台公开接口 ==========
    
    @Override
    @Cacheable(value = "config", key = "'public'")
    public Map<String, Object> getPublicConfig() {
        Map<String, Object> result = new LinkedHashMap<>();
        
        // 网站信息 - 全部公开
        result.put("site", getSiteConfig());
        
        // 作者信息 - 过滤敏感字段
        AuthorConfigDTO author = getAuthorConfig();
        if (author != null) {
            result.put("author", author.toPublicView());
        }
        
        // 封面配置 - 全部公开
        result.put("cover", getCoverConfig());
        
        // 社交链接 - 全部公开
        result.put("social", getSocialConfig());
        
        // 隐私配置 - 全部公开（前台需要知道显示什么）
        result.put("privacy", getPrivacyConfig());
        
        // 评论配置 - 部分公开
        CommentConfigDTO comment = getCommentConfig();
        if (comment != null) {
            result.put("comment", comment.toPublicView());
        }
        
        // notify、upload、email 不返回给前台
        
        return result;
    }
}
