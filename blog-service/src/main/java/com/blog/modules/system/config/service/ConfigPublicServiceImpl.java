package com.blog.modules.system.config.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.system.config.mapper.SysConfigMapper;
import com.blog.modules.system.config.model.dto.config.AuthorConfigDTO;
import com.blog.modules.system.config.model.dto.config.CommentConfigDTO;
import com.blog.modules.system.config.model.entity.SysConfig;
import com.blog.modules.system.config.model.vo.ConfigVO;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ConfigPublicServiceImpl implements ConfigPublicService {
    @Autowired
    private SysConfigMapper sysConfigMapper;

    @Autowired
    private SiteConfigService siteConfigService;

    @Override
    public ConfigVO getByKey(String key) {
        SysConfig config = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                .eq(SysConfig::getConfigKey, key));
        if (config == null) {
            return null;
        }
        return convertToVO(config);
    }

    @Override
    @Cacheable(value = "siteConfig", key = "'all'", unless = "#result == null")
    public Map<String, Object> getSiteConfig() {
        Map<String, Object> result = new LinkedHashMap<>();

        // 网站信息 - 全部公开
        result.put("site", siteConfigService.getSiteConfig());

        // 作者信息 - 过滤敏感字段
        AuthorConfigDTO author = siteConfigService.getAuthorConfig();
        if (author != null) {
            result.put("author", author.toPublicView());
        }

        // 封面配置 - 全部公开
        result.put("cover", siteConfigService.getCoverConfig());

        // 社交链接 - 全部公开
        result.put("social", siteConfigService.getSocialConfig());

        // 隐私配置 - 全部公开（前台需要知道显示什么）
        result.put("privacy", siteConfigService.getPrivacyConfig());

        // 评论配置 - 部分公开
        CommentConfigDTO comment = siteConfigService.getCommentConfig();
        if (comment != null) {
            result.put("comment", comment.toPublicView());
        }

        // 组件配置 - 全部公开
        result.put("component", siteConfigService.getComponentConfig());

        // notify、upload、email 不返回给前台

        return result;
    }

    private ConfigVO convertToVO(SysConfig config) {
        ConfigVO vo = BeanUtil.copyProperties(config, ConfigVO.class);
        return vo;
    }

    private Object parseValue(String value, String type) {
        if (value == null || value.isEmpty()) {
            if ("boolean".equals(type)) {
                return false;
            }
            if ("number".equals(type)) {
                return 0;
            }
            return "";
        }
        if (type == null || "string".equals(type) || "text".equals(type) || 
            "image".equals(type) || "password".equals(type)) {
            return value;
        }
        switch (type) {
            case "number":
                try {
                    return Integer.parseInt(value);
                } catch (NumberFormatException e) {
                    return 0;
                }
            case "boolean":
                return "true".equalsIgnoreCase(value);
            case "json":
                try {
                    return JsonUtil.fromJson(value, Object.class);
                } catch (Exception e) {
                    return value;
                }
            default:
                return value;
        }
    }
}

