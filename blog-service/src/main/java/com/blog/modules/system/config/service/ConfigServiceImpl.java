package com.blog.modules.system.config.service;





import com.blog.modules.file.model.vo.FileVO;
import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.system.config.mapper.SysConfigMapper;
import com.blog.modules.file.service.FileService;
import com.blog.modules.file.mapper.FileMetaMapper;
import com.blog.modules.file.model.entity.FileMeta;
import com.blog.modules.system.config.model.entity.SysConfig;
import com.blog.modules.system.config.model.vo.ConfigVO;
import com.blog.modules.system.config.service.ConfigService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.EventUtil;
import com.blog.infrastructure.revalidate.RevalidateClient;
import com.blog.infrastructure.revalidate.RevalidateTags;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Slf4j
@Service
public class ConfigServiceImpl implements ConfigService {
    @Autowired
    private SysConfigMapper sysConfigMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    private FileMetaMapper fileMetaMapper;

    @Autowired(required = false)
    private RevalidateClient revalidateClient;

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
        // 转换为VO时不包含文件列表
        return configs.stream()
                .map(this::convertToVOWithoutFiles)
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
        return convertToVOWithoutFiles(config);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(
        put = @CachePut(value = "configs", key = "'key:' + #configDTO.configKey"),
        evict = {
            @CacheEvict(value = "configs", allEntries = true),
            @CacheEvict(value = "configs", key = "'list:' + (#configDTO.groupName != null ? #configDTO.groupName : 'all')"),
            @CacheEvict(value = "configs", key = "'groups'"),
            @CacheEvict(value = "siteConfig", key = "'all'")
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

            // 处理文件引用关系：验证前端提交的引用列表
            if (configDTO.getReferencedFileIds() != null && !configDTO.getReferencedFileIds().isEmpty()) {
                List<Long> validFileIds = new ArrayList<>();
                for (Long fileId : configDTO.getReferencedFileIds()) {
                    // 检查文件是否在配置值中使用
                    if (isFileInConfig(fileId, configDTO.getValue())) {
                        validFileIds.add(fileId);
                    }
                }
                // 只为在配置值中找到的文件建立引用关系
                if (!validFileIds.isEmpty()) {
                    fileService.addReferences(validFileIds, "CONFIG", config.getId());
                }
            }

            ConfigVO result = convertToVOWithoutFiles(config);
            triggerSiteConfigRevalidate();
            return result;
        } catch (Exception e) {
            log.error("创建配置失败: error={}", e.getMessage());
            throw new BusinessException("配置创建失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(
        put = @CachePut(value = "configs", key = "'key:' + #key"),
        evict = {
            @CacheEvict(value = "configs", allEntries = true),
            @CacheEvict(value = "siteConfig", key = "'all'")
        }
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

            // 处理文件引用关系：验证前端提交的引用列表
            List<Long> validFileIds = new ArrayList<>();
            if (configDTO.getReferencedFileIds() != null && !configDTO.getReferencedFileIds().isEmpty()) {
                for (Long fileId : configDTO.getReferencedFileIds()) {
                    // 检查文件是否在新的配置值中使用
                    if (isFileInConfig(fileId, existingConfig.getValue())) {
                        validFileIds.add(fileId);
                    }
                }
            }

            // 获取旧的引用文件列表（从数据库查询）
            List<Long> oldFileIds = fileService.listByReference("CONFIG", existingConfig.getId())
                    .stream()
                    .map(FileVO::getId)
                    .collect(Collectors.toList());

            // 更新文件引用关系（删除旧的，添加验证过的新引用）
            fileService.updateReferences(
                oldFileIds.isEmpty() ? null : oldFileIds,
                validFileIds.isEmpty() ? null : validFileIds,
                "CONFIG",
                existingConfig.getId()
            );

            SysConfig finalConfig = sysConfigMapper.selectById(existingConfig.getId());
            ConfigVO result = convertToVOWithoutFiles(finalConfig);
            triggerSiteConfigRevalidate();
            return result;
        } catch (Exception e) {
            log.error("更新配置失败: key={}, error={}", key, e.getMessage());
            throw new BusinessException("配置更新失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
        @CacheEvict(value = "configs", allEntries = true),
        @CacheEvict(value = "siteConfig", key = "'all'")
    })
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
        triggerSiteConfigRevalidate();
    }

    /**
     * 转换为VO并填充引用文件列表
     */
    private ConfigVO convertToVO(SysConfig config) {
        ConfigVO vo = BeanUtil.copyProperties(config, ConfigVO.class);

        // 填充引用文件列表
        List<FileVO> referencedFiles = fileService.listByReference("CONFIG", config.getId());
        vo.setReferencedFiles(referencedFiles);

        return vo;
    }

    /**
     * 转换为VO（不包含文件列表）
     * 用于缓存配置数据，文件列表按需查询
     */
    private ConfigVO convertToVOWithoutFiles(SysConfig config) {
        return BeanUtil.copyProperties(config, ConfigVO.class);
    }

    private void triggerSiteConfigRevalidate() {
        if (revalidateClient == null) {
            return;
        }
        EventUtil.publishEventAfterCommit(() -> revalidateClient.revalidateTags(RevalidateTags.SITE_CONFIG));
    }

    /**
     * 检查文件是否在配置值中使用
     * @param fileId 文件ID
     * @param configValue 配置值
     * @return 是否在使用中
     */
    private boolean isFileInConfig(Long fileId, String configValue) {
        if (fileId == null || configValue == null) {
            return false;
        }

        // 查询文件信息
        FileMeta fileMeta = fileMetaMapper.selectById(fileId);
        if (fileMeta == null) {
            return false;
        }

        String fileUrl = fileMeta.getUrl();

        // 检查是否在配置值中
        // 配置值可能是URL、JSON、纯文本等各种格式
        return configValue.contains(fileUrl);
    }
}

