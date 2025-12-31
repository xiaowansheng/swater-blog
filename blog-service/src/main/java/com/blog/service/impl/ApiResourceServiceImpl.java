package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.cache.ApiResourceCache;
import com.blog.mapper.SysApiMapper;
import com.blog.model.dto.ApiResourceDTO;
import com.blog.model.entity.SysApi;
import com.blog.model.vo.ApiResourceVO;
import com.blog.service.ApiResourceService;
import com.blog.util.ApiResourceScanner;
import com.blog.util.BeanUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApiResourceServiceImpl implements ApiResourceService {
    @Autowired
    private SysApiMapper sysApiMapper;

    @Autowired
    private ApiResourceScanner apiResourceScanner;

    @Autowired
    private ApiResourceCache apiResourceCache;

    @Override
    public List<ApiResourceVO> list() {
        LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(SysApi::getSort)
                .orderByDesc(SysApi::getCreateTime);

        List<SysApi> apis = sysApiMapper.selectList(wrapper);
        return apis.stream()
                .map(api -> BeanUtil.copyProperties(api, ApiResourceVO.class))
                .collect(Collectors.toList());
    }

    @Override
    public ApiResourceVO getById(Long id) {
        SysApi api = sysApiMapper.selectById(id);
        if (api == null || api.getDeleted() == 1) {
            return null;
        }
        return BeanUtil.copyProperties(api, ApiResourceVO.class);
    }

    @Override
    @Transactional
    public void update(Long id, ApiResourceDTO dto) {
        SysApi api = sysApiMapper.selectById(id);
        if (api == null || api.getDeleted() == 1) {
            return;
        }
        BeanUtils.copyProperties(dto, api);
        sysApiMapper.updateById(api);

        // 清除缓存，等待下一次访问时重新加载
        apiResourceCache.clear();
    }

    @Override
    @Transactional
    public void refresh() {
        List<ApiResourceScanner.ApiResourceInfo> resources = apiResourceScanner.scanApiResources();

        // 分离模块和接口
        List<ApiResourceScanner.ApiResourceInfo> modules = new ArrayList<>();
        List<ApiResourceScanner.ApiResourceInfo> apis = new ArrayList<>();

        for (ApiResourceScanner.ApiResourceInfo info : resources) {
            if (info.isModule()) {
                modules.add(info);
            } else {
                apis.add(info);
            }
        }

        // 用于存储模块的 apiKey → ID 映射
        Map<String, Long> moduleApiKeyToIdMap = new HashMap<>();

        // 第一步：处理所有模块
        for (ApiResourceScanner.ApiResourceInfo moduleInfo : modules) {
            LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysApi::getApiKey, moduleInfo.getApiKey());

            SysApi existingModule = sysApiMapper.selectOne(wrapper);

            if (existingModule == null) {
                SysApi module = new SysApi();
                module.setApiKey(moduleInfo.getApiKey());
                module.setName(moduleInfo.getName());
                module.setPath(moduleInfo.getPath());
                module.setMethod(moduleInfo.getMethod());
                module.setDescription(moduleInfo.getDescription());
                module.setIsOpen(moduleInfo.getIsOpen());
                module.setSort(0);
                module.setParentId(0L); // 模块的parentId设为0
                sysApiMapper.insert(module);
                moduleApiKeyToIdMap.put(moduleInfo.getApiKey(), module.getId());
            } else {
                existingModule.setName(moduleInfo.getName());
                existingModule.setPath(moduleInfo.getPath());
                existingModule.setMethod(moduleInfo.getMethod());
                existingModule.setDescription(moduleInfo.getDescription());
                existingModule.setIsOpen(moduleInfo.getIsOpen());
                existingModule.setParentId(0L); // 确保模块的parentId为0
                sysApiMapper.updateById(existingModule);
                moduleApiKeyToIdMap.put(moduleInfo.getApiKey(), existingModule.getId());
            }
        }

        // 第二步：处理所有接口，设置parentId
        for (ApiResourceScanner.ApiResourceInfo apiInfo : apis) {
            LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysApi::getApiKey, apiInfo.getApiKey());

            SysApi existingApi = sysApiMapper.selectOne(wrapper);

            if (existingApi == null) {
                SysApi api = new SysApi();
                api.setApiKey(apiInfo.getApiKey());
                api.setName(apiInfo.getName());
                api.setPath(apiInfo.getPath());
                api.setMethod(apiInfo.getMethod());
                api.setDescription(apiInfo.getDescription());
                api.setIsOpen(apiInfo.getIsOpen());
                api.setSort(0);

                // 从路径推断模块的apiKey（路径的第一部分通常是模块）
                String moduleApiKey = inferModuleApiKeyFromPath(apiInfo.getPath(), moduleApiKeyToIdMap);
                Long parentId = moduleApiKeyToIdMap.get(moduleApiKey);
                api.setParentId(parentId != null ? parentId : 0L);

                sysApiMapper.insert(api);
            } else {
                existingApi.setName(apiInfo.getName());
                existingApi.setPath(apiInfo.getPath());
                existingApi.setMethod(apiInfo.getMethod());
                existingApi.setDescription(apiInfo.getDescription());
                existingApi.setIsOpen(apiInfo.getIsOpen());

                // 更新parentId
                String moduleApiKey = inferModuleApiKeyFromPath(apiInfo.getPath(), moduleApiKeyToIdMap);
                Long parentId = moduleApiKeyToIdMap.get(moduleApiKey);
                existingApi.setParentId(parentId != null ? parentId : 0L);

                sysApiMapper.updateById(existingApi);
            }
        }

        // 清除缓存，等待下一次访问时重新加载
        apiResourceCache.clear();
    }

    /**
     * 从接口路径推断模块的apiKey
     * 例如：/admin/user → admin
     */
    private String inferModuleApiKeyFromPath(String path, Map<String, Long> moduleApiKeyToIdMap) {
        if (path == null || path.isEmpty()) {
            return null;
        }

        // 移除开头的斜杠，按斜杠分割
        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
        String[] parts = cleanPath.split("/");

        if (parts.length > 0) {
            // 取路径的第一部分作为模块key
            String possibleModuleKey = parts[0];
            // 检查这个key是否在模块map中
            if (moduleApiKeyToIdMap.containsKey(possibleModuleKey)) {
                return possibleModuleKey;
            }
        }

        return null;
    }
}
