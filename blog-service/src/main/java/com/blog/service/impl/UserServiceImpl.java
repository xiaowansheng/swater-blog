package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.event.user.*;
import com.blog.exception.BusinessException;
import com.blog.mapper.UserMapper;
import com.blog.model.dto.ResetPasswordDTO;
import com.blog.model.dto.UserDTO;
import com.blog.model.entity.User;
import com.blog.model.vo.RoleVO;
import com.blog.model.vo.UserVO;
import com.blog.service.RoleService;
import com.blog.service.UserService;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
import com.blog.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.time.LocalDateTime;
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
    public PageResult<UserVO> list(Long page, Long size, String keyword) {
        Page<User> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getDeleted, 0);
        
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(User::getUsername, keyword)
                    .or().like(User::getNickname, keyword)
                    .or().like(User::getEmail, keyword));
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
        if (user == null || user.getDeleted() == 1) {
            return null;
        }
        return convertToVO(user);
    }

    @Override
    @Transactional
    public Long create(UserDTO dto) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, dto.getUsername()).eq(User::getDeleted, 0);
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("用户名已存在");
        }
        
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            wrapper.clear();
            wrapper.eq(User::getEmail, dto.getEmail()).eq(User::getDeleted, 0);
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
        if (dto.getRole() == null) {
            user.setRole("user");
        }
        
        userMapper.insert(user);
        
        User savedUser = userMapper.selectById(user.getId());
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new UserCreatedEvent(this, user.getId(), savedUser)));
        
        return user.getId();
    }

    @Override
    @Transactional
    @CacheEvict(value = "user", key = "#id")
    public void update(Long id, UserDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null || user.getDeleted() == 1) {
            throw new BusinessException("用户不存在");
        }
        
        if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getUsername, dto.getUsername()).eq(User::getDeleted, 0).ne(User::getId, id);
            if (userMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("用户名已存在");
            }
        }
        
        if (dto.getEmail() != null && !dto.getEmail().isEmpty() && !dto.getEmail().equals(user.getEmail())) {
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getEmail, dto.getEmail()).eq(User::getDeleted, 0).ne(User::getId, id);
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
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus());
        user.setDisabled(dto.getDisabled());
        
        userMapper.updateById(user);
        
        User updatedUser = userMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new UserUpdatedEvent(this, id, updatedUser)));
    }

    @Override
    @Transactional
    @CacheEvict(value = "user", key = "#id")
    public void delete(Long id) {
        User user = userMapper.selectById(id);
        if (user == null || user.getDeleted() == 1) {
            throw new BusinessException("用户不存在");
        }
        userMapper.deleteById(id);
        
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new UserDeletedEvent(this, id)));
    }

    @Override
    @Transactional
    @CacheEvict(value = "user", key = "#id")
    public void resetPassword(Long id, ResetPasswordDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null || user.getDeleted() == 1) {
            throw new BusinessException("用户不存在");
        }
        user.setPassword(PasswordUtil.encode(dto.getPassword()));
        userMapper.updateById(user);
        
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new UserPasswordResetEvent(this, id)));
    }

    private UserVO convertToVO(User user) {
        UserVO vo = BeanUtil.copyProperties(user, UserVO.class);
        if (user.getRole() != null && !user.getRole().isEmpty()) {
            // 根据用户的role字段获取角色信息
            RoleVO role = roleService.getByName(user.getRole());
            if (role != null) {
                vo.setRoles(List.of(role));
            }
        }
        return vo;
    }

    private void publishEventAfterCommit(Runnable runnable) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
                @Override
                public void afterCommit() {
                    runnable.run();
                }
            });
        } else {
            runnable.run();
        }
    }
}

