package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.SysApiMapper;
import com.blog.model.dto.ApiDTO;
import com.blog.model.entity.SysApi;
import com.blog.model.vo.ApiVO;
import com.blog.service.ApiService;
import com.blog.util.BeanUtil;
import com.blog.util.KeyUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApiServiceImpl implements ApiService {
    @Autowired
    private SysApiMapper sysApiMapper;

    @Override
    public List<ApiVO> list() {
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
        return api.getId();
    }

    @Override
    @Transactional
    public void update(Long id, ApiDTO dto) {
        SysApi api = sysApiMapper.selectById(id);
        if (api == null) {
            throw new BusinessException("接口不存在");
        }

        if (dto.getApiKey() != null && !dto.getApiKey().equals(api.getApiKey())) {
            LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysApi::getApiKey, dto.getApiKey()).ne(SysApi::getId, id);
            if (sysApiMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("接口标识已存在");
            }
        }

        BeanUtils.copyProperties(dto, api);
        sysApiMapper.updateById(api);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        SysApi api = sysApiMapper.selectById(id);
        if (api == null) {
            throw new BusinessException("接口不存在");
        }

        LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysApi::getParentId, id);
        if (sysApiMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子接口，无法删除");
        }

        sysApiMapper.deleteById(id);
    }

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
