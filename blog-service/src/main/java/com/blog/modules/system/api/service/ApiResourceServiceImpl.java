package com.blog.modules.system.api.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.infrastructure.cache.ApiResourceCache;
import com.blog.modules.system.api.mapper.SysApiMapper;
import com.blog.modules.system.api.model.dto.ApiResourceDTO;
import com.blog.modules.system.api.model.entity.SysApi;
import com.blog.modules.system.api.model.vo.ApiResourceVO;
import com.blog.modules.system.api.service.ApiResourceService;
import com.blog.shared.util.ApiResourceScanner;
import com.blog.shared.util.BeanUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
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
        if (api == null) {
            return null;
        }
        return BeanUtil.copyProperties(api, ApiResourceVO.class);
    }

    @Override
    @Transactional
    public void update(Long id, ApiResourceDTO dto) {
        SysApi api = sysApiMapper.selectById(id);
        if (api == null) {
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
        // 获取树形结构的模块列表
        List<ApiResourceScanner.ModuleNode> modules = apiResourceScanner.scanApiResources();

        // 遍历每个模块及其子接口
        for (ApiResourceScanner.ModuleNode moduleNode : modules) {
            // 第一步：处理模块（插入或更新），获取模块ID
            Long moduleId = processModule(moduleNode);

            // 第二步：处理该模块下的所有接口，使用模块ID作为parentId
            if (moduleNode.getApis() != null && !moduleNode.getApis().isEmpty()) {
                for (ApiResourceScanner.ApiNode apiNode : moduleNode.getApis()) {
                    processApi(apiNode, moduleId);
                }
            }
        }

        // 清除缓存，等待下一次访问时重新加载
        apiResourceCache.clear();
    }

    /**
     * 处理模块：插入或更新，返回模块ID
     */
    private Long processModule(ApiResourceScanner.ModuleNode moduleNode) {
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
            return module.getId();
        } else {
            // 更新模块
            existingModule.setName(moduleNode.getName());
            existingModule.setPath(moduleNode.getPath());
            existingModule.setMethod(moduleNode.getMethod());
            existingModule.setDescription(moduleNode.getDescription());
            existingModule.setIsOpen(moduleNode.getIsOpen());
            existingModule.setParentId(0L); // 确保模块的parentId为0
            sysApiMapper.updateById(existingModule);
            return existingModule.getId();
        }
    }

    /**
     * 处理接口：插入或更新，使用指定的模块ID作为parentId
     */
    private void processApi(ApiResourceScanner.ApiNode apiNode, Long parentId) {
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
        }
    }
}
