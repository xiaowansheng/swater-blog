package com.blog.modules.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.user.model.dto.UpdatePasswordDTO;
import com.blog.modules.user.model.dto.UpdateProfileDTO;
import com.blog.modules.user.model.dto.AdminResetPasswordDTO;
import com.blog.modules.user.model.dto.UserDTO;
import com.blog.modules.user.model.vo.UserVO;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.user.event.UserCreatedEvent;
import com.blog.modules.user.event.UserUpdatedEvent;
import com.blog.modules.user.event.UserDeletedEvent;
import com.blog.modules.user.event.UserPasswordResetEvent;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.system.role.model.vo.RoleVO;
import com.blog.modules.user.model.vo.UserVO;
import com.blog.modules.system.role.service.RoleService;
import com.blog.modules.user.service.UserService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.PageUtil;
import com.blog.shared.util.PasswordUtil;
import com.blog.bootstrap.context.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleService roleService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public PageResult<UserVO> list(Long page, Long size, String username, String nickname, String email, Long roleId,
            Integer status) {
        Page<User> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

        if (username != null && !username.isEmpty()) {
            wrapper.like(User::getUsername, username);
        }
        if (nickname != null && !nickname.isEmpty()) {
            wrapper.like(User::getNickname, nickname);
        }
        if (email != null && !email.isEmpty()) {
            wrapper.like(User::getEmail, email);
        }
        if (roleId != null) {
            RoleVO role = roleService.getById(roleId);
            if (role != null) {
                wrapper.eq(User::getRoleKey, role.getRoleKey());
            }
        }
        if (status != null) {
            wrapper.eq(User::getStatus, status);
        }
        wrapper.orderByDesc(User::getCreateTime);

        Page<User> result = userMapper.selectPage(pageParam, wrapper);
        List<UserVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    @Cacheable(value = "user", key = "#id")
    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return null;
        }
        return convertToVO(user);
    }

    @Override
    @Transactional
    public Long create(UserDTO dto) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, dto.getUsername());
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("用户名已存在");
        }

        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            wrapper.clear();
            wrapper.eq(User::getEmail, dto.getEmail());
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("邮箱已存在");
            }
        }

        User user = BeanUtil.copyProperties(dto, User.class);
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(PasswordUtil.encode(dto.getPassword()));
        }
        if (dto.getStatus() == null) {
            user.setStatus(1);
        }
        if (dto.getDisabled() == null) {
            user.setDisabled(0);
        }
        if (dto.getRoleKey() == null) {
            user.setRoleKey("user");
        }

        userMapper.insert(user);

        EventUtil.publishEventAfterCommit(
                () -> eventPublisher.publishEvent(new UserCreatedEvent(this, user.getId(), user)));

        return user.getId();
    }

    @Override
    @Transactional
    @CacheEvict(value = "user", key = "#id")
    public void update(Long id, UserDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getUsername, dto.getUsername()).ne(User::getId, id);
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("用户名已存在");
            }
        }

        if (dto.getEmail() != null && !dto.getEmail().isEmpty() && !dto.getEmail().equals(user.getEmail())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getEmail, dto.getEmail()).ne(User::getId, id);
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("邮箱已存在");
            }
        }

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setNickname(dto.getNickname());
        user.setAvatar(dto.getAvatar());
        user.setPhone(dto.getPhone());
        user.setQq(dto.getQq());
        user.setSignature(dto.getSignature());
        user.setWebsite(dto.getWebsite());
        user.setIntroduction(dto.getIntroduction());
        user.setRoleKey(dto.getRoleKey());
        user.setStatus(dto.getStatus());
        user.setDisabled(dto.getDisabled());

        userMapper.updateById(user);

        User updatedUser = userMapper.selectById(id);
        EventUtil.publishEventAfterCommit(
                () -> eventPublisher.publishEvent(new UserUpdatedEvent(this, id, updatedUser)));
    }

    @Override
    @Transactional
    @CacheEvict(value = "user", key = "#id")
    public void delete(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        userMapper.deleteById(id);

        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new UserDeletedEvent(this, id)));
    }

    @Override
    @Transactional
    @CacheEvict(value = "user", key = "#id")
    public void resetPassword(Long id, AdminResetPasswordDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setPassword(PasswordUtil.encode(dto.getPassword()));
        userMapper.updateById(user);

        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new UserPasswordResetEvent(this, id)));
    }

    @Override
    @Transactional
    @CacheEvict(value = "user", key = "#id")
    public void assignRoles(Long id, List<Long> roleIds) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 由于用户表只有一个role字段，这里只分配第一个角色
        if (roleIds != null && !roleIds.isEmpty()) {
            Long roleId = roleIds.get(0);
            RoleVO role = roleService.getById(roleId);
            if (role != null) {
                user.setRoleKey(role.getRoleKey());
                userMapper.updateById(user);
            } else {
                throw new BusinessException("角色不存在");
            }
        } else {
            // 如果没有提供角色，设置为默认用户角色
            user.setRoleKey("user");
            userMapper.updateById(user);
        }

        User updatedUser = userMapper.selectById(id);
        EventUtil.publishEventAfterCommit(
                () -> eventPublisher.publishEvent(new UserUpdatedEvent(this, id, updatedUser)));
    }

    private UserVO convertToVO(User user) {
        UserVO vo = BeanUtil.copyProperties(user, UserVO.class);
        if (user.getRoleKey() != null && !user.getRoleKey().isEmpty()) {
            // 根据用户的roleKey字段获取角色信息
            RoleVO role = roleService.getByName(user.getRoleKey());
            if (role != null) {
                vo.setRoles(List.of(role));
            }
        }
        return vo;
    }

    @Override
    @Transactional
    public void updateProfile(UpdateProfileDTO dto) {
        Long userId = UserContext.getCurrentUserId();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 更新邮箱时检查是否重复
        if (dto.getEmail() != null && !dto.getEmail().isEmpty() && !dto.getEmail().equals(user.getEmail())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getEmail, dto.getEmail()).ne(User::getId, userId);
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("邮箱已被其他用户使用");
            }
        }

        // 只更新允许修改的字段
        if (dto.getNickname() != null && !dto.getNickname().isEmpty()) {
            user.setNickname(dto.getNickname());
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getAvatar() != null) {
            user.setAvatar(dto.getAvatar());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getQq() != null) {
            user.setQq(dto.getQq());
        }
        if (dto.getSignature() != null) {
            user.setSignature(dto.getSignature());
        }
        if (dto.getWebsite() != null) {
            user.setWebsite(dto.getWebsite());
        }
        if (dto.getIntroduction() != null) {
            user.setIntroduction(dto.getIntroduction());
        }

        userMapper.updateById(user);

        User updatedUser = userMapper.selectById(userId);
        EventUtil.publishEventAfterCommit(
                () -> eventPublisher.publishEvent(new UserUpdatedEvent(this, userId, updatedUser)));
    }

    @Override
    @Transactional
    public void updatePassword(UpdatePasswordDTO dto) {
        Long userId = UserContext.getCurrentUserId();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 验证旧密码
        if (!PasswordUtil.matches(dto.getOldPassword(), user.getPassword())) {
            throw new BusinessException("当前密码不正确");
        }

        // 更新密码
        user.setPassword(PasswordUtil.encode(dto.getNewPassword()));
        userMapper.updateById(user);

        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new UserPasswordResetEvent(this, userId)));
    }
}
