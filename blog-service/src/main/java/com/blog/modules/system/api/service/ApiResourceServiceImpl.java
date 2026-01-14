package com.blog.modules.system.api.service;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.infrastructure.cache.ApiResourceCache;
import com.blog.modules.system.api.mapper.SysApiMapper;
import com.blog.modules.system.api.model.dto.ApiDTO;
import com.blog.modules.system.api.model.entity.SysApi;
import com.blog.modules.system.api.model.vo.ApiRefreshResultVO;
import com.blog.modules.system.api.model.vo.ApiVO;
import com.blog.shared.exception.BusinessException;
import com.blog.shared.util.ApiResourceScanner;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.KeyUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * API接口资源服务实现
 * <p>
 * 提供接口资源的管理功能，支持手动CRUD和自动刷新
 * </p>
 */
@Service
public class ApiResourceServiceImpl implements ApiResourceService {

    @Autowired
    private SysApiMapper sysApiMapper;

    @Autowired
    private ApiResourceScanner apiResourceScanner;

    @Autowired
    private ApiResourceCache apiResourceCache;

    @Override
    public List<ApiVO> tree() {
        LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(SysApi::getSort)
                .orderByDesc(SysApi::getCreateTime);

        List<SysApi> apis = sysApiMapper.selectList(wrapper);
        List<ApiVO> voList = apis.stream()
                .map(api -> BeanUtil.copyProperties(api, ApiVO.class))
                .collect(Collectors.toList());

        return buildTree(voList);
    }

    @Override
    public ApiVO getById(Long id) {
        SysApi api = sysApiMapper.selectById(id);
        if (api == null) {
            return null;
        }
        return BeanUtil.copyProperties(api, ApiVO.class);
    }

    @Override
    @Transactional
    public Long create(ApiDTO dto) {
        // 生成或验证apiKey
        if (dto.getApiKey() == null || dto.getApiKey().isEmpty()) {
            dto.setApiKey(KeyUtil.generateKey("api"));
        } else {
            LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysApi::getApiKey, dto.getApiKey());
            if (sysApiMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("接口标识已存在");
            }
        }

        SysApi api = BeanUtil.copyProperties(dto, SysApi.class);
        if (api.getIsOpen() == null) {
            api.setIsOpen(0);
        }
        if (api.getSort() == null) {
            api.setSort(0);
        }
        if (api.getParentId() == null) {
            api.setParentId(0L);
        }

        sysApiMapper.insert(api);

        // 清除缓存
        apiResourceCache.clear();

        return api.getId();
    }

    @Override
    @Transactional
    public void update(Long id, ApiDTO dto) {
        SysApi api = sysApiMapper.selectById(id);
        if (api == null) {
            throw new BusinessException("接口不存在");
        }

        // 验证apiKey唯一性
        if (dto.getApiKey() != null && !dto.getApiKey().equals(api.getApiKey())) {
            LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysApi::getApiKey, dto.getApiKey()).ne(SysApi::getId, id);
            if (sysApiMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("接口标识已存在");
            }
        }

        BeanUtils.copyProperties(dto, api);
        sysApiMapper.updateById(api);

        // 清除缓存
        apiResourceCache.clear();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        SysApi api = sysApiMapper.selectById(id);
        if (api == null) {
            throw new BusinessException("接口不存在");
        }

        // 检查是否有子接口
        LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysApi::getParentId, id);
        if (sysApiMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子接口，无法删除");
        }

        sysApiMapper.deleteById(id);

        // 清除缓存
        apiResourceCache.clear();
    }

    @Override
    @Transactional
    public ApiRefreshResultVO refresh() {
        long startTime = System.currentTimeMillis();

        // 统计计数器
        int createdModules = 0;
        int updatedModules = 0;
        int createdApis = 0;
        int updatedApis = 0;

        // 获取树形结构的模块列表
        List<ApiResourceScanner.ModuleNode> modules = apiResourceScanner.scanApiResources();

        // 遍历每个模块及其子接口
        for (ApiResourceScanner.ModuleNode moduleNode : modules) {
            // 第一步：处理模块（插入或更新），获取模块ID和操作类型
            ProcessResult moduleResult = processModule(moduleNode);
            if (moduleResult.created) {
                createdModules++;
            } else {
                updatedModules++;
            }

            // 第二步：处理该模块下的所有接口，使用模块ID作为parentId
            if (moduleNode.getApis() != null && !moduleNode.getApis().isEmpty()) {
                for (ApiResourceScanner.ApiNode apiNode : moduleNode.getApis()) {
                    ProcessResult apiResult = processApi(apiNode, moduleResult.id);
                    if (apiResult.created) {
                        createdApis++;
                    } else {
                        updatedApis++;
                    }
                }
            }
        }

        // 清除缓存，等待下一次访问时重新加载
        apiResourceCache.clear();

        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        return new ApiRefreshResultVO(createdModules, updatedModules, createdApis, updatedApis, executionTime);
    }

    /**
     * 处理结果
     */
    private static class ProcessResult {
        Long id;
        boolean created;

        ProcessResult(Long id, boolean created) {
            this.id = id;
            this.created = created;
        }
    }

    /**
     * 处理模块：插入或更新，返回处理结果
     */
    private ProcessResult processModule(ApiResourceScanner.ModuleNode moduleNode) {
        LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysApi::getApiKey, moduleNode.getApiKey());

        SysApi existingModule = sysApiMapper.selectOne(wrapper);

        if (existingModule == null) {
            // 新增模块
            SysApi module = new SysApi();
            module.setApiKey(moduleNode.getApiKey());
            module.setName(moduleNode.getName());
            module.setPath(moduleNode.getPath());
            module.setMethod(moduleNode.getMethod());
            module.setDescription(moduleNode.getDescription());
            module.setIsOpen(moduleNode.getIsOpen());
            module.setSort(0);
            module.setParentId(0L); // 模块的parentId设为0
            sysApiMapper.insert(module);
            return new ProcessResult(module.getId(), true);
        } else {
            // 更新模块
            existingModule.setName(moduleNode.getName());
            existingModule.setPath(moduleNode.getPath());
            existingModule.setMethod(moduleNode.getMethod());
            existingModule.setDescription(moduleNode.getDescription());
            existingModule.setIsOpen(moduleNode.getIsOpen());
            existingModule.setParentId(0L); // 确保模块的parentId为0
            sysApiMapper.updateById(existingModule);
            return new ProcessResult(existingModule.getId(), false);
        }
    }

    /**
     * 处理接口：插入或更新，使用指定的模块ID作为parentId
     */
    private ProcessResult processApi(ApiResourceScanner.ApiNode apiNode, Long parentId) {
        LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysApi::getPath, apiNode.getPath());
        wrapper.eq(SysApi::getMethod, apiNode.getMethod());

        SysApi existingApi = sysApiMapper.selectOne(wrapper);

        if (existingApi == null) {
            // 新增接口
            SysApi api = new SysApi();
            api.setApiKey(apiNode.getApiKey());
            api.setName(apiNode.getName());
            api.setPath(apiNode.getPath());
            api.setMethod(apiNode.getMethod());
            api.setDescription(apiNode.getDescription());
            api.setIsOpen(apiNode.getIsOpen());
            api.setSort(0);
            api.setParentId(parentId); // 直接使用模块ID
            sysApiMapper.insert(api);
            return new ProcessResult(api.getId(), true);
        } else {
            // 更新接口
            existingApi.setApiKey(apiNode.getApiKey());
            existingApi.setName(apiNode.getName());
            existingApi.setPath(apiNode.getPath());
            existingApi.setMethod(apiNode.getMethod());
            existingApi.setDescription(apiNode.getDescription());
            existingApi.setIsOpen(apiNode.getIsOpen());
            existingApi.setParentId(parentId); // 更新parentId为模块ID
            sysApiMapper.updateById(existingApi);
            return new ProcessResult(existingApi.getId(), false);
        }
    }

    /**
     * 构建树形结构
     */
    private List<ApiVO> buildTree(List<ApiVO> apiList) {
        Map<Long, ApiVO> apiMap = apiList.stream()
                .collect(Collectors.toMap(ApiVO::getId, api -> api));

        List<ApiVO> rootApis = new ArrayList<>();
        for (ApiVO api : apiList) {
            if (api.getParentId() == null || api.getParentId() == 0) {
                rootApis.add(api);
            } else {
                ApiVO parent = apiMap.get(api.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(api);
                }
            }
        }
        return rootApis;
    }
}
