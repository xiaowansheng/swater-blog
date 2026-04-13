package com.blog.modules.system.role.service;

import com.blog.modules.system.role.mapper.RoleApiMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.system.role.mapper.RoleMapper;
import com.blog.modules.system.role.model.dto.RoleDTO;
import com.blog.modules.system.role.model.entity.Role;
import com.blog.modules.system.role.model.entity.RoleApi;
import com.blog.modules.system.role.model.vo.RoleVO;
import com.blog.modules.system.role.service.RoleService;
import com.blog.shared.model.enums.DisabledFlag;
import com.blog.shared.model.enums.EnableStatus;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.KeyUtil;
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
        List<Role> roles = roleMapper.selectList(wrapper);
        return BeanUtil.copyList(roles, RoleVO.class);
    }

    @Override
    public RoleVO getById(Long id) {
        Role role = roleMapper.selectById(id);
        if (role == null) {
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
    public RoleVO getByName(String roleName) {
        if (roleName == null || roleName.isEmpty()) {
            return null;
        }
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Role::getRoleKey, roleName);
        Role role = roleMapper.selectOne(wrapper);
        if (role == null) {
            return null;
        }
        return BeanUtil.copyProperties(role, RoleVO.class);
    }

    @Override
    @Transactional
    public Long create(RoleDTO dto) {
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Role::getRoleKey, dto.getRoleKey());
        if (roleMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("角色标签已存在");
        }

        Role role = BeanUtil.copyProperties(dto, Role.class);
        if (dto.getStatus() == null) {
            role.setStatus(EnableStatus.ENABLED.getCode());
        }
        if (dto.getDisabled() == null) {
            role.setDisabled(DisabledFlag.NO.getCode());
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
        if (role == null) {
            throw new BusinessException("角色不存在");
        }

        if (dto.getRoleKey() != null && !dto.getRoleKey().equals(role.getRoleKey())) {
            LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Role::getRoleKey, dto.getRoleKey()).ne(Role::getId, id);
            if (roleMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("角色标签已存在");
            }
        }

        role.setName(dto.getName());
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
        if (role == null) {
            throw new BusinessException("角色不存在");
        }
        roleMapper.deleteById(id);
        roleApiMapper.deleteByRoleId(id);
    }

    @Override
    @Transactional
    public void assignApis(Long id, List<Long> apiIds) {
        Role role = roleMapper.selectById(id);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }
        roleApiMapper.deleteByRoleId(id);
        if (apiIds != null && !apiIds.isEmpty()) {
            saveRoleApis(id, apiIds);
        }
    }

    @Override
    public List<Long> getApiIdsByRoleId(Long id) {
        return roleApiMapper.selectApiIdsByRoleId(id);
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

