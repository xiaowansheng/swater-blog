package com.blog.modules.system.config.service;

import com.blog.modules.system.config.model.dto.ConfigDTO;
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
import com.blog.modules.system.config.model.vo.ConfigVO;
import com.blog.shared.util.JsonUtil;
import com.blog.infrastructure.revalidate.RevalidateClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
@Slf4j
@Service
public class SiteConfigServiceImpl implements SiteConfigService {

    @Autowired
    private ConfigService configService;

    @Autowired(required = false)
    private RevalidateClient revalidateClient;

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
    private static final String KEY_COMPONENT = "component.enabled";

    // Next.js revalidate tags
    private static final List<String> SITE_CONFIG_TAGS = List.of("site:config");

    // ========== 通用方法 ==========
    
    private <T> T getConfig(String key, Class<T> clazz) {
        ConfigVO config = configService.getByKey(key);
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
    
    /**
     * 触发 Next.js 缓存重新验证
     */
    private void revalidateSiteConfig() {
        if (revalidateClient != null) {
            revalidateClient.revalidateTags(SITE_CONFIG_TAGS);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    protected void updateConfig(String key, Object config) {
        String jsonValue = JsonUtil.toJson(config);
        ConfigVO existingConfig = configService.getByKey(key);
        
        if (existingConfig != null) {
            log.info("更新现有配置: key={}", key);
            ConfigDTO updateDTO = new ConfigDTO();
            updateDTO.setValue(jsonValue);
            configService.updateByKey(key, updateDTO);
        } else {
            log.info("创建新配置: key={}", key);
            ConfigDTO createDTO = new ConfigDTO();
            createDTO.setConfigKey(key);
            createDTO.setValue(jsonValue);
            createDTO.setName(key); // 默认名称使用key
            createDTO.setGroupName("site"); // 默认分组
            configService.create(createDTO);
        }
    }
    
    // ========== 获取配置 ==========
    
    @Override
    @Cacheable(value = "configs", key = "'site'", unless = "#result == null")
    public SiteConfigDTO getSiteConfig() {
        return getConfig(KEY_SITE, SiteConfigDTO.class);
    }

    @Override
    @Cacheable(value = "configs", key = "'author'", unless = "#result == null")
    public AuthorConfigDTO getAuthorConfig() {
        return getConfig(KEY_AUTHOR, AuthorConfigDTO.class);
    }

    @Override
    @Cacheable(value = "configs", key = "'cover'", unless = "#result == null")
    public CoverConfigDTO getCoverConfig() {
        return getConfig(KEY_COVER, CoverConfigDTO.class);
    }

    @Override
    @Cacheable(value = "configs", key = "'social'", unless = "#result == null")
    public SocialConfigDTO getSocialConfig() {
        return getConfig(KEY_SOCIAL, SocialConfigDTO.class);
    }

    @Override
    @Cacheable(value = "configs", key = "'privacy'", unless = "#result == null")
    public PrivacyConfigDTO getPrivacyConfig() {
        return getConfig(KEY_PRIVACY, PrivacyConfigDTO.class);
    }

    @Override
    @Cacheable(value = "configs", key = "'comment'", unless = "#result == null")
    public CommentConfigDTO getCommentConfig() {
        return getConfig(KEY_COMMENT, CommentConfigDTO.class);
    }

    @Override
    @Cacheable(value = "configs", key = "'component'", unless = "#result == null")
    public ComponentConfigDTO getComponentConfig() {
        ComponentConfigDTO config = getConfig(KEY_COMPONENT, ComponentConfigDTO.class);
        if (config == null) {
            // 返回默认配置，所有组件启用
            config = new ComponentConfigDTO();
            config.setArticleCommentEnabled(true);
            config.setTalkCommentEnabled(true);
            config.setGuestbookMessageEnabled(true);
        }
        return config;
    }

    @Override
    @Cacheable(value = "configs", key = "'notify'", unless = "#result == null")
    public NotifyConfigDTO getNotifyConfig() {
        return getConfig(KEY_NOTIFY, NotifyConfigDTO.class);
    }

    @Override
    @Cacheable(value = "configs", key = "'upload'", unless = "#result == null")
    public UploadConfigDTO getUploadConfig() {
        return getConfig(KEY_UPLOAD, UploadConfigDTO.class);
    }

    @Override
    @Cacheable(value = "configs", key = "'email'", unless = "#result == null")
    public EmailConfigDTO getEmailConfig() {
        return getConfig(KEY_EMAIL, EmailConfigDTO.class);
    }
    
    // ========== 更新配置 ==========
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'site'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateSiteConfig(SiteConfigDTO config) {
        updateConfig(KEY_SITE, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'author'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateAuthorConfig(AuthorConfigDTO config) {
        updateConfig(KEY_AUTHOR, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'cover'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateCoverConfig(CoverConfigDTO config) {
        updateConfig(KEY_COVER, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'social'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateSocialConfig(SocialConfigDTO config) {
        updateConfig(KEY_SOCIAL, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'privacy'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updatePrivacyConfig(PrivacyConfigDTO config) {
        updateConfig(KEY_PRIVACY, config);
        revalidateSiteConfig();
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'comment'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateCommentConfig(CommentConfigDTO config) {
        updateConfig(KEY_COMMENT, config);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", allEntries = true),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateComponentConfig(ComponentConfigDTO config) {
        updateConfig(KEY_COMPONENT, config);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'notify'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateNotifyConfig(NotifyConfigDTO config) {
        updateConfig(KEY_NOTIFY, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'upload'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateUploadConfig(UploadConfigDTO config) {
        updateConfig(KEY_UPLOAD, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'email'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional
    public void updateEmailConfig(EmailConfigDTO config) {
        updateConfig(KEY_EMAIL, config);
    }
    
    // ========== 前台公开接口 ==========
    
    @Override
    @Cacheable(value = "configs", key = "'public'", unless = "#result == null || #result.isEmpty()")
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

        // 组件配置 - 全部公开
        result.put("component", getComponentConfig());

        // notify、upload、email 不返回给前台

        return result;
    }
}
