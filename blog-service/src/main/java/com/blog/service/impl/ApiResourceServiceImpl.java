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

        for (ApiResourceScanner.ApiResourceInfo info : resources) {
            LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysApi::getApiKey, info.getApiKey());

            SysApi existingApi = sysApiMapper.selectOne(wrapper);

            if (existingApi == null) {
                SysApi api = new SysApi();
                api.setApiKey(info.getApiKey());
                api.setName(info.getName());
                api.setPath(info.getPath());
                api.setMethod(info.getMethod());
                api.setDescription(info.getDescription());
                api.setIsOpen(info.getIsOpen());
                api.setSort(0);
                sysApiMapper.insert(api);
            } else {
                existingApi.setName(info.getName());
                existingApi.setPath(info.getPath());
                existingApi.setMethod(info.getMethod());
                existingApi.setDescription(info.getDescription());
                existingApi.setIsOpen(info.getIsOpen());
                sysApiMapper.updateById(existingApi);
            }
        }

        // 清除缓存，等待下一次访问时重新加载
        apiResourceCache.clear();
    }
}
