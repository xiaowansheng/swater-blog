package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.SysConfigMapper;
import com.blog.model.dto.ConfigDTO;
import com.blog.model.entity.SysConfig;
import com.blog.model.vo.ConfigVO;
import com.blog.service.ConfigService;
import com.blog.util.BeanUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ConfigServiceImpl implements ConfigService {
    @Autowired
    private SysConfigMapper sysConfigMapper;

    @Override
    public List<ConfigVO> list(String groupName) {
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysConfig::getDeleted, 0);
        if (groupName != null && !groupName.isEmpty()) {
            wrapper.eq(SysConfig::getGroupName, groupName);
        }
        wrapper.orderByAsc(SysConfig::getSort);
        
        List<SysConfig> configs = sysConfigMapper.selectList(wrapper);
        return configs.stream()
                .map(config -> BeanUtil.copyProperties(config, ConfigVO.class))
                .collect(Collectors.toList());
    }

    @Override
    public ConfigVO getByKey(String key) {
        SysConfig config = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                .eq(SysConfig::getConfigKey, key)
                .eq(SysConfig::getDeleted, 0));
        if (config == null) {
            return null;
        }
        return BeanUtil.copyProperties(config, ConfigVO.class);
    }

    @Override
    @Transactional
    public void updateByKey(String key, String value) {
        SysConfig config = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                .eq(SysConfig::getConfigKey, key)
                .eq(SysConfig::getDeleted, 0));
        if (config == null) {
            throw new BusinessException("配置不存在");
        }
        config.setValue(value);
        sysConfigMapper.updateById(config);
    }

    @Override
    @Transactional
    public void updateBatch(Map<String, Object> configs) {
        for (Map.Entry<String, Object> entry : configs.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            String valueStr = value != null ? value.toString() : "";
            
            SysConfig config = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                    .eq(SysConfig::getConfigKey, key)
                    .eq(SysConfig::getDeleted, 0));
            if (config != null) {
                config.setValue(valueStr);
                sysConfigMapper.updateById(config);
            }
        }
    }
}

