package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.SysConfigMapper;
import com.blog.model.dto.ConfigDTO;
import com.blog.model.entity.SysConfig;
import com.blog.model.vo.ConfigVO;
import com.blog.service.ConfigService;
import com.blog.util.BeanUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
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
        wrapper.orderByAsc(SysConfig::getGroupName);
        wrapper.orderByAsc(SysConfig::getSort);
        
        List<SysConfig> configs = sysConfigMapper.selectList(wrapper);
        return configs.stream()
                .map(config -> BeanUtil.copyProperties(config, ConfigVO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getGroups() {
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysConfig::getDeleted, 0);
        wrapper.select(SysConfig::getGroupName);
        wrapper.groupBy(SysConfig::getGroupName);
        wrapper.orderByAsc(SysConfig::getGroupName);
        
        List<SysConfig> configs = sysConfigMapper.selectList(wrapper);
        return configs.stream()
                .map(SysConfig::getGroupName)
                .filter(g -> g != null && !g.isEmpty())
                .distinct()
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
    @Transactional(rollbackFor = Exception.class)
    public ConfigVO updateByKey(String key, ConfigDTO configDTO) {
        log.info("开始更新配置信息: key={}", key);
        try {
            // 1. 优先根据 configKey 查询是否存在记录
            SysConfig existingConfig = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                    .eq(SysConfig::getConfigKey, key)
                    .eq(SysConfig::getDeleted, 0));

            SysConfig configToSave;
            if (existingConfig != null) {
                // 2. 存在则更新
                log.info("查询到现有配置记录, 执行更新操作: key={}", key);
                configToSave = existingConfig;
                // 仅更新允许修改的字段
                if (configDTO.getName() != null) configToSave.setName(configDTO.getName());
                if (configDTO.getValue() != null) configToSave.setValue(configDTO.getValue());
                if (configDTO.getType() != null) configToSave.setType(configDTO.getType());
                if (configDTO.getDescription() != null) configToSave.setDescription(configDTO.getDescription());
                if (configDTO.getGroupName() != null) configToSave.setGroupName(configDTO.getGroupName());
                if (configDTO.getSort() != null) configToSave.setSort(configDTO.getSort());
                sysConfigMapper.updateById(configToSave);
            } else {
                // 3. 不存在则插入
                log.info("未查询到配置记录, 执行新增操作: key={}", key);
                configToSave = BeanUtil.copyProperties(configDTO, SysConfig.class);
                configToSave.setConfigKey(key); // 确保 key 一致
                sysConfigMapper.insert(configToSave);
            }

            // 4. 返回完整数据
            SysConfig finalConfig = sysConfigMapper.selectById(configToSave.getId());
            return BeanUtil.copyProperties(finalConfig, ConfigVO.class);
        } catch (Exception e) {
            log.error("更新配置失败: key={}, error={}", key, e.getMessage());
            throw new BusinessException("配置更新失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
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

