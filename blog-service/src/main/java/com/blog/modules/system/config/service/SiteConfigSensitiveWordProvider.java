package com.blog.modules.system.config.service;

import com.blog.modules.system.config.model.dto.config.CommentConfigDTO;
import com.blog.shared.SensitiveWordConfigProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 从数据库评论配置（comment.sensitiveWords）读取自定义敏感词，
 * 作为 shared 层 {@link com.blog.shared.SensitiveWordHelper} 的配置来源。
 * 放在 system/config 模块内，避免 shared 反向依赖业务模块。
 */
@Slf4j
@Component
public class SiteConfigSensitiveWordProvider implements SensitiveWordConfigProvider {

    @Autowired(required = false)
    private SiteConfigService siteConfigService;

    @Override
    public List<String> loadCustomWords() {
        if (siteConfigService == null) {
            return Collections.emptyList();
        }
        try {
            CommentConfigDTO commentConfig = siteConfigService.getCommentConfig();
            if (commentConfig == null || commentConfig.getSensitiveWords() == null
                    || commentConfig.getSensitiveWords().isBlank()) {
                return Collections.emptyList();
            }
            List<String> words = new ArrayList<>();
            for (String w : commentConfig.getSensitiveWords().split("[,\\R]")) {
                String trimmed = w.trim();
                if (!trimmed.isEmpty()) {
                    words.add(trimmed);
                }
            }
            return Collections.unmodifiableList(words);
        } catch (Exception e) {
            log.warn("加载自定义敏感词失败，使用空自定义词库: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
