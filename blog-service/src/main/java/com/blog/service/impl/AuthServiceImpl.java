package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.UserMapper;
import com.blog.model.dto.LoginDTO;
import com.blog.model.entity.User;
import com.blog.model.vo.LoginVO;
import com.blog.model.vo.RoleVO;
import com.blog.model.vo.UserVO;

import com.blog.event.user.UserLoggedInEvent;
import com.blog.event.user.UserLoggedOutEvent;
import com.blog.service.AuthService;
import com.blog.util.BeanUtil;
import com.blog.util.PasswordUtil;
import com.blog.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private com.blog.service.RoleService roleService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public LoginVO login(LoginDTO dto) {
        log.info("用户尝试登录: {}", dto.getUsername());
        
        // 支持用户名或邮箱登录
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .and(w -> w.eq(User::getUsername, dto.getUsername())
                        .or().eq(User::getEmail, dto.getUsername()))
                .eq(User::getDeleted, 0));
        
        if (user == null) {
            log.warn("登录失败: 用户 {} 不存在", dto.getUsername());
            throw new BusinessException("用户名或密码错误");
        }
        
        if (user.getStatus() != null && user.getStatus() == 0) {
            log.warn("登录失败: 用户 {} 已被禁用", dto.getUsername());
            throw new BusinessException("用户已被禁用");
        }
        
        if (user.getDisabled() != null && user.getDisabled() == 1) {
            log.warn("登录失败: 用户 {} 已被禁用", dto.getUsername());
            throw new BusinessException("用户已被禁用");
        }
        
        if (!PasswordUtil.matches(dto.getPassword(), user.getPassword())) {
            log.warn("登录失败: 用户 {} 密码不匹配", dto.getUsername());
            throw new BusinessException("用户名或密码错误");
        }
        
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();
        
        user.setLastLoginTime(LocalDateTime.now());
        userMapper.updateById(user);
        

        
        UserVO userVO = convertToVO(user);
        
        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUser(userVO);
        
        String ip = RequestUtil.getClientIp();
        eventPublisher.publishEvent(new UserLoggedInEvent(this, user.getId(), ip != null ? ip : ""));
        
        return loginVO;
    }

    @Override
    public void logout() {
        Long userId = null;
        if (StpUtil.isLogin()) {
            userId = StpUtil.getLoginIdAsLong();
        }
        StpUtil.logout();
        if (userId != null) {
            eventPublisher.publishEvent(new UserLoggedOutEvent(this, userId));
        }
    }

    @Override
    public UserVO getCurrentUser() {
        if (!StpUtil.isLogin()) {
            throw new BusinessException("未登录");
        }
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userMapper.selectById(userId);
        if (user == null || user.getDeleted() == 1) {
            throw new BusinessException("用户不存在");
        }
        return convertToVO(user);
    }

    @Override
    public String refreshToken() {
        if (!StpUtil.isLogin()) {
            throw new BusinessException("未登录");
        }
        StpUtil.renewTimeout(2592000);
        return StpUtil.getTokenValue();
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


}

