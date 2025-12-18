package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.RoleApiMapper;
import com.blog.mapper.RoleMapper;
import com.blog.model.dto.RoleDTO;
import com.blog.model.entity.Role;
import com.blog.model.entity.RoleApi;
import com.blog.model.vo.RoleVO;
import com.blog.service.RoleService;
import com.blog.util.BeanUtil;
import com.blog.util.KeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {
    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private RoleApiMapper roleApiMapper;

    @Override
    public List<RoleVO> list() {
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Role::getDeleted, 0);
        List<Role> roles = roleMapper.selectList(wrapper);
        return BeanUtil.copyList(roles, RoleVO.class);
    }

    @Override
    public RoleVO getById(Long id) {
        Role role = roleMapper.selectById(id);
        if (role == null || role.getDeleted() == 1) {
            return null;
        }
        return BeanUtil.copyProperties(role, RoleVO.class);
    }

    @Override
    public List<RoleVO> getByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<Role> roles = roleMapper.selectBatchIds(ids);
        return BeanUtil.copyList(roles, RoleVO.class);
    }

    @Override
    @Transactional
    public Long create(RoleDTO dto) {
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Role::getCode, dto.getCode()).eq(Role::getDeleted, 0);
        if (roleMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("角色代码已存在");
        }
        
        wrapper.clear();
        wrapper.eq(Role::getRoleKey, dto.getRoleKey()).eq(Role::getDeleted, 0);
        if (roleMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("角色标签已存在");
        }
        
        Role role = BeanUtil.copyProperties(dto, Role.class);
        if (dto.getStatus() == null) {
            role.setStatus(1);
        }
        if (dto.getDisabled() == null) {
            role.setDisabled(0);
        }
        
        roleMapper.insert(role);
        
        if (dto.getApiIds() != null && !dto.getApiIds().isEmpty()) {
            saveRoleApis(role.getId(), dto.getApiIds());
        }
        
        return role.getId();
    }

    @Override
    @Transactional
    public void update(Long id, RoleDTO dto) {
        Role role = roleMapper.selectById(id);
        if (role == null || role.getDeleted() == 1) {
            throw new BusinessException("角色不存在");
        }
        
        if (dto.getCode() != null && !dto.getCode().equals(role.getCode())) {
            LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Role::getCode, dto.getCode()).eq(Role::getDeleted, 0).ne(Role::getId, id);
            if (roleMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("角色代码已存在");
            }
        }
        
        if (dto.getRoleKey() != null && !dto.getRoleKey().equals(role.getRoleKey())) {
            LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Role::getRoleKey, dto.getRoleKey()).eq(Role::getDeleted, 0).ne(Role::getId, id);
            if (roleMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("角色标签已存在");
            }
        }
        
        role.setName(dto.getName());
        role.setCode(dto.getCode());
        role.setRoleKey(dto.getRoleKey());
        role.setDescription(dto.getDescription());
        role.setStatus(dto.getStatus());
        role.setDisabled(dto.getDisabled());
        
        roleMapper.updateById(role);
        
        if (dto.getApiIds() != null) {
            roleApiMapper.deleteByRoleId(id);
            if (!dto.getApiIds().isEmpty()) {
                saveRoleApis(id, dto.getApiIds());
            }
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Role role = roleMapper.selectById(id);
        if (role == null || role.getDeleted() == 1) {
            throw new BusinessException("角色不存在");
        }
        roleMapper.deleteById(id);
        roleApiMapper.deleteByRoleId(id);
    }

    @Override
    @Transactional
    public void assignApis(Long id, List<Long> apiIds) {
        Role role = roleMapper.selectById(id);
        if (role == null || role.getDeleted() == 1) {
            throw new BusinessException("角色不存在");
        }
        roleApiMapper.deleteByRoleId(id);
        if (apiIds != null && !apiIds.isEmpty()) {
            saveRoleApis(id, apiIds);
        }
    }

    private void saveRoleApis(Long roleId, List<Long> apiIds) {
        for (Long apiId : apiIds) {
            RoleApi roleApi = new RoleApi();
            roleApi.setRoleId(roleId);
            roleApi.setApiId(apiId);
            roleApi.setCreateTime(LocalDateTime.now());
            roleApiMapper.insert(roleApi);
        }
    }
}

