package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.mapper.SysConfigMapper;
import com.blog.model.entity.SysConfig;
import com.blog.model.vo.ConfigVO;
import com.blog.service.ConfigPublicService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ConfigPublicServiceImpl implements ConfigPublicService {
    @Autowired
    private SysConfigMapper sysConfigMapper;

    @Override
    public ConfigVO getByKey(String key) {
        SysConfig config = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                .eq(SysConfig::getConfigKey, key)
                .eq(SysConfig::getDeleted, 0));
        if (config == null) {
            return null;
        }
        return convertToVO(config);
    }

    @Override
    public Map<String, Object> getByGroup(String groupName) {
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysConfig::getDeleted, 0);
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

    private ConfigVO convertToVO(SysConfig config) {
        ConfigVO vo = BeanUtil.copyProperties(config, ConfigVO.class);
        return vo;
    }

    private Object parseValue(String value, String type) {
        if (value == null) {
            return null;
        }
        if (type == null || "string".equals(type)) {
            return value;
        }
        switch (type) {
            case "int":
                try {
                    return Integer.parseInt(value);
                } catch (NumberFormatException e) {
                    return value;
                }
            case "boolean":
                return Boolean.parseBoolean(value);
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

