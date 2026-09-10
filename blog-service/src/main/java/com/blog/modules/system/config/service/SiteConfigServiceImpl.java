package com.blog.modules.system.config.service;

import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.system.config.model.dto.config.EmailConfigDTO;
import com.blog.modules.system.config.model.dto.config.UploadConfigDTO;
import com.blog.modules.system.config.model.dto.config.NotifyConfigDTO;
import com.blog.modules.system.config.model.dto.config.CommentConfigDTO;
import com.blog.modules.system.config.model.dto.config.PrivacyConfigDTO;
import com.blog.modules.system.config.model.dto.config.SocialConfigDTO;
import com.blog.modules.system.config.model.dto.config.RewardConfigDTO;
import com.blog.modules.system.config.model.dto.config.CoverConfigDTO;
import com.blog.modules.system.config.model.dto.config.AuthorConfigDTO;
import com.blog.modules.system.config.model.dto.config.SiteConfigDTO;
import com.blog.modules.system.config.model.dto.config.ComponentConfigDTO;
import com.blog.modules.system.config.model.dto.config.WebhookConfigDTO;
import com.blog.modules.system.config.model.vo.ConfigVO;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.EventUtil;
import com.blog.infrastructure.revalidate.RevalidateClient;
import com.blog.infrastructure.revalidate.RevalidateTags;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class SiteConfigServiceImpl implements SiteConfigService {

    @Autowired
    private ConfigService configService;

    @Autowired(required = false)
    private RevalidateClient revalidateClient;

    /**
     * 敏感词助手：评论配置更新后需热加载自定义敏感词。
     * 使用 @Lazy 打破 Helper -> SiteConfigService -> Helper 的循环依赖。
     */
    @org.springframework.context.annotation.Lazy
    @Autowired(required = false)
    private com.blog.shared.SensitiveWordHelper sensitiveWordHelper;

    // 配置key常量
    private static final String KEY_SITE = "site";
    private static final String KEY_AUTHOR = "author";
    private static final String KEY_COVER = "cover";
    private static final String KEY_SOCIAL = "social";
    private static final String KEY_REWARD = "reward";
    private static final String KEY_PRIVACY = "privacy";
    private static final String KEY_COMMENT = "comment";
    private static final String KEY_NOTIFY = "notify";
    private static final String KEY_UPLOAD = "upload";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_COMPONENT = "component";
    private static final String KEY_WEBHOOK = "webhook";

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
            revalidateClient.revalidateTags(RevalidateTags.SITE_CONFIG);
        }
    }

    /**
     * 校验上传配置：
     * - maxSize 必须落在 [1KB, 1GB] 区间，防止被设成破坏性值（0 / 负数 / 极大值）
     * - allowedTypes 非空时必须为合法的逗号分隔扩展名列表
     */
    private void validateUploadConfig(UploadConfigDTO config) {
        if (config == null) {
            throw new com.blog.shared.exception.BusinessException("上传配置不能为空");
        }
        long minSize = 1024L;                 // 1KB
        long maxSizeLimit = 1024L * 1024 * 1024; // 1GB
        Long maxSize = config.getMaxSize();
        if (maxSize == null || maxSize < minSize || maxSize > maxSizeLimit) {
            throw new com.blog.shared.exception.BusinessException(
                    "上传大小限制必须在 1KB ~ 1GB 之间");
        }
        String allowedTypes = config.getAllowedTypes();
        if (allowedTypes != null && !allowedTypes.isBlank()) {
            for (String t : allowedTypes.split(",")) {
                String s = t.trim();
                if (s.isEmpty() || !s.matches("[A-Za-z0-9]+")) {
                    throw new com.blog.shared.exception.BusinessException(
                            "允许的文件类型格式非法: " + t);
                }
            }
        }
    }

    /**
     * 校验评论配置：maxLength 若设置必须落在 [1, 2000]，防止设成 0 / 负数 / 极大值。
     */
    private void validateCommentConfig(CommentConfigDTO config) {
        if (config == null) {
            throw new com.blog.shared.exception.BusinessException("评论配置不能为空");
        }
        Integer maxLength = config.getMaxLength();
        if (maxLength != null && (maxLength < 1 || maxLength > 2000)) {
            throw new com.blog.shared.exception.BusinessException(
                    "评论最大长度限制必须在 1 ~ 2000 之间");
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
        EventUtil.publishEventAfterCommit(this::revalidateSiteConfig);
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
    public RewardConfigDTO getRewardConfig() {
        return getConfig(KEY_REWARD, RewardConfigDTO.class);
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
    @Transactional(rollbackFor = Exception.class)
    public void updateSiteConfig(SiteConfigDTO config) {
        updateConfig(KEY_SITE, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'author'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateAuthorConfig(AuthorConfigDTO config) {
        updateConfig(KEY_AUTHOR, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'cover'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateCoverConfig(CoverConfigDTO config) {
        updateConfig(KEY_COVER, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'social'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateSocialConfig(SocialConfigDTO config) {
        updateConfig(KEY_SOCIAL, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateRewardConfig(RewardConfigDTO config) {
        updateConfig(KEY_REWARD, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'privacy'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updatePrivacyConfig(PrivacyConfigDTO config) {
        updateConfig(KEY_PRIVACY, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'comment'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateCommentConfig(CommentConfigDTO config) {
        validateCommentConfig(config);
        updateConfig(KEY_COMMENT, config);
        // 评论配置更新后热加载自定义敏感词（在事务提交后执行）
        EventUtil.publishEventAfterCommit(() -> {
            if (sensitiveWordHelper != null) {
                sensitiveWordHelper.reloadCustomWords();
            }
        });
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", allEntries = true),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateComponentConfig(ComponentConfigDTO config) {
        updateConfig(KEY_COMPONENT, config);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'notify'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateNotifyConfig(NotifyConfigDTO config) {
        updateConfig(KEY_NOTIFY, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'upload'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateUploadConfig(UploadConfigDTO config) {
        validateUploadConfig(config);
        updateConfig(KEY_UPLOAD, config);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'email'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateEmailConfig(EmailConfigDTO config) {
        updateConfig(KEY_EMAIL, config);
    }

    @Override
    @Cacheable(value = "configs", key = "'webhook'")
    public WebhookConfigDTO getWebhookConfig() {
        return getConfig(KEY_WEBHOOK, WebhookConfigDTO.class);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "configs", key = "'webhook'"),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
    @Transactional(rollbackFor = Exception.class)
    public void updateWebhookConfig(WebhookConfigDTO config) {
        if (config != null && config.getWebhooks() != null) {
            WebhookConfigDTO existing = getWebhookConfig();
            if (existing != null && existing.getWebhooks() != null) {
                for (WebhookConfigDTO.WebhookItem item : config.getWebhooks()) {
                    if (item.getSecret() == null || item.getSecret().isEmpty()) {
                        for (WebhookConfigDTO.WebhookItem oldItem : existing.getWebhooks()) {
                            if (item.getId() != null && item.getId().equals(oldItem.getId())) {
                                item.setSecret(oldItem.getSecret());
                                break;
                            }
                        }
                    }
                }
            }
        }
        updateConfig(KEY_WEBHOOK, config);
    }
    
}
