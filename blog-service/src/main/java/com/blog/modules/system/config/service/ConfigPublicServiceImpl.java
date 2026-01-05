package com.blog.modules.system.config.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.system.config.mapper.SysConfigMapper;
import com.blog.modules.system.config.model.entity.SysConfig;
import com.blog.modules.system.config.model.vo.ConfigVO;
import com.blog.modules.system.config.service.ConfigPublicService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class ConfigPublicServiceImpl implements ConfigPublicService {
    @Autowired
    private SysConfigMapper sysConfigMapper;

    // 前台需要的配置分组
    private static final List<String> SITE_CONFIG_GROUPS = Arrays.asList(
            "网站信息", "作者信息", "封面配置", "隐私设置"
    );

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
    public Map<String, Object> getByGroup(String groupName) {
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<>();
        if (groupName != null && !groupName.isEmpty()) {
            wrapper.eq(SysConfig::getGroupName, groupName);
        }
        wrapper.orderByAsc(SysConfig::getSort);
        
        List<SysConfig> configs = sysConfigMapper.selectList(wrapper);
        Map<String, Object> result = new HashMap<>();
        
        for (SysConfig config : configs) {
            Object value = parseValue(config.getValue(), config.getType());
            result.put(config.getConfigKey(), value);
        }
        
        return result;
    }

    @Override
    @Cacheable(value = "siteConfig", key = "'all'", unless = "#result == null")
    public Map<String, Object> getSiteConfig() {
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(SysConfig::getGroupName, SITE_CONFIG_GROUPS);
        wrapper.orderByAsc(SysConfig::getGroupName);
        wrapper.orderByAsc(SysConfig::getSort);
        
        List<SysConfig> configs = sysConfigMapper.selectList(wrapper);
        
        // 按分组组织配置
        Map<String, Object> result = new LinkedHashMap<>();
        Map<String, Map<String, Object>> groupedConfigs = new LinkedHashMap<>();
        
        for (SysConfig config : configs) {
            String groupName = config.getGroupName();
            String simpleKey = getSimpleKey(config.getConfigKey());
            Object value = parseValue(config.getValue(), config.getType());
            
            // 按分组存储
            groupedConfigs.computeIfAbsent(groupName, k -> new LinkedHashMap<>())
                    .put(simpleKey, value);
            
            // 同时存储完整key
            result.put(config.getConfigKey(), value);
        }
        
        // 添加分组数据
        result.put("site", groupedConfigs.getOrDefault("网站信息", new HashMap<>()));
        result.put("author", groupedConfigs.getOrDefault("作者信息", new HashMap<>()));
        result.put("cover", groupedConfigs.getOrDefault("封面配置", new HashMap<>()));
        result.put("privacy", groupedConfigs.getOrDefault("隐私设置", new HashMap<>()));
        
        return result;
    }

    /**
     * 获取配置key的简化名称
     * 例如: site.name -> name, author.avatar -> avatar
     */
    private String getSimpleKey(String configKey) {
        if (configKey == null) {
            return null;
        }
        int dotIndex = configKey.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < configKey.length() - 1) {
            return configKey.substring(dotIndex + 1);
        }
        return configKey;
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

