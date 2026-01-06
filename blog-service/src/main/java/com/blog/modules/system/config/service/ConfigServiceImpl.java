package com.blog.modules.system.config.service;





import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.system.config.mapper.SysConfigMapper;
import com.blog.modules.system.config.model.entity.SysConfig;
import com.blog.modules.system.config.model.vo.ConfigVO;
import com.blog.modules.system.config.service.ConfigService;
import com.blog.shared.util.BeanUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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
    @Cacheable(value = "configs", key = "'list:' + (#groupName != null ? #groupName : 'all')", unless = "#result == null || #result.isEmpty()")
    public List<ConfigVO> list(String groupName) {
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<>();
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
    @Cacheable(value = "configs", key = "'groups'", unless = "#result == null || #result.isEmpty()")
    public List<String> getGroups() {
        LambdaQueryWrapper<SysConfig> wrapper = new LambdaQueryWrapper<>();
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
    @Cacheable(value = "configs", key = "'key:' + #key", unless = "#result == null")
    public ConfigVO getByKey(String key) {
        SysConfig config = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                .eq(SysConfig::getConfigKey, key));
        if (config == null) {
            return null;
        }
        return BeanUtil.copyProperties(config, ConfigVO.class);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(
        put = @CachePut(value = "configs", key = "'key:' + #configDTO.configKey"),
        evict = {
            @CacheEvict(value = "configs", key = "'list:' + (#configDTO.groupName != null ? #configDTO.groupName : 'all')"),
            @CacheEvict(value = "configs", key = "'groups'")
        }
    )
    public ConfigVO create(ConfigDTO configDTO) {
        try {
            SysConfig config = new SysConfig();
            config.setConfigKey(configDTO.getConfigKey());
            config.setName(configDTO.getName());
            config.setValue(configDTO.getValue());
            config.setType(configDTO.getType());
            config.setDescription(configDTO.getDescription());
            config.setGroupName(configDTO.getGroupName());
            config.setSort(configDTO.getSort() != null ? configDTO.getSort() : 0);
            sysConfigMapper.insert(config);
            return BeanUtil.copyProperties(config, ConfigVO.class);
        } catch (Exception e) {
            log.error("创建配置失败: error={}", e.getMessage());
            throw new BusinessException("配置创建失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(
        put = @CachePut(value = "configs", key = "'key:' + #key"),
        evict = @CacheEvict(value = "configs", allEntries = true)
    )
    public ConfigVO updateByKey(String key, ConfigDTO configDTO) {
        try {
            SysConfig existingConfig = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                    .eq(SysConfig::getConfigKey, key));

            if (existingConfig == null) {
                throw new BusinessException("配置项不存在: " + key);
            }
            
            if (configDTO.getName() != null) {
                existingConfig.setName(configDTO.getName());
            }
            if (configDTO.getValue() != null) {
                existingConfig.setValue(configDTO.getValue());
            }
            if (configDTO.getType() != null) {
                existingConfig.setType(configDTO.getType());
            }
            if (configDTO.getDescription() != null) {
                existingConfig.setDescription(configDTO.getDescription());
            }
            if (configDTO.getGroupName() != null) {
                existingConfig.setGroupName(configDTO.getGroupName());
            }
            if (configDTO.getSort() != null) {
                existingConfig.setSort(configDTO.getSort());
            }
            sysConfigMapper.updateById(existingConfig);
            SysConfig finalConfig = sysConfigMapper.selectById(existingConfig.getId());
            return BeanUtil.copyProperties(finalConfig, ConfigVO.class);
        } catch (Exception e) {
            log.error("更新配置失败: key={}, error={}", key, e.getMessage());
            throw new BusinessException("配置更新失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "configs", allEntries = true)
    public void updateBatch(Map<String, Object> configs) {
        for (Map.Entry<String, Object> entry : configs.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            String valueStr = value != null ? value.toString() : "";

            SysConfig config = sysConfigMapper.selectOne(new LambdaQueryWrapper<SysConfig>()
                    .eq(SysConfig::getConfigKey, key));
            if (config != null) {
                config.setValue(valueStr);
                sysConfigMapper.updateById(config);
            }
        }
    }
}

