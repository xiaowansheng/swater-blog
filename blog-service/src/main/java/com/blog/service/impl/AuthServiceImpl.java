package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.UserMapper;
import com.blog.mapper.UserRoleMapper;
import com.blog.model.dto.LoginDTO;
import com.blog.model.entity.User;
import com.blog.model.vo.LoginVO;
import com.blog.model.vo.RoleVO;
import com.blog.model.vo.UserVO;
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderFactory;
import com.blog.plugin.location.LocationProviderPlugin;
import com.blog.service.AuthService;
import com.blog.service.LoginLogService;
import com.blog.util.BeanUtil;
import com.blog.util.PasswordUtil;
import com.blog.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
    private UserRoleMapper userRoleMapper;

    @Autowired
    private com.blog.service.RoleService roleService;

    @Autowired
    private LoginLogService loginLogService;
    
    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Override
    public LoginVO login(LoginDTO dto) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, dto.getUsername())
                .eq(User::getDeleted, 0));
        
        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }
        
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }
        
        if (user.getDisabled() != null && user.getDisabled() == 1) {
            throw new BusinessException("用户已被禁用");
        }
        
        if (!PasswordUtil.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();
        
        user.setLastLoginTime(LocalDateTime.now());
        userMapper.updateById(user);
        
        try {
            HttpServletRequest request = RequestUtil.getRequest();
            if (request != null) {
                String ip = RequestUtil.getClientIp(request);
                String userAgent = RequestUtil.getUserAgent(request);
                String device = parseDevice(userAgent);
                String browser = parseBrowser(userAgent);
                
                String country = null;
                String province = null;
                String city = null;
                java.math.BigDecimal latitude = null;
                java.math.BigDecimal longitude = null;
                String locationDetail = null;
                String ipAddress = ip;
                
                if (locationProviderFactory != null) {
                    try {
                        List<LocationProviderPlugin> providers = locationProviderFactory.getProviders();
                        LocationInfo locationInfo = null;
                        for (LocationProviderPlugin locationProvider : providers) {
                            locationInfo = locationProvider.getLocationInfo(ip);
                            if (locationInfo != null) {
                                break;
                            }
                        }
                        if (locationInfo != null) {
                            if (locationInfo != null) {
                                country = locationInfo.getCountry();
                                province = locationInfo.getProvince();
                                city = locationInfo.getCity();
                                latitude = locationInfo.getLatitude();
                                longitude = locationInfo.getLongitude();
                                locationDetail = locationInfo.getLocationDetail();
                                if (locationInfo.getIpAddress() != null && !locationInfo.getIpAddress().isEmpty()) {
                                    ipAddress = locationInfo.getIpAddress();
                                }
                        }
                    } catch (Exception e) {
                        log.warn("IP定位失败，IP: {}", ip, e);
                    }
                }
                
                loginLogService.recordLogin(
                    user.getId(),
                    ip,
                    ipAddress,
                    country,
                    province,
                    city,
                    latitude,
                    longitude,
                    locationDetail,
                    userAgent,
                    device,
                    browser,
                    locationDetail,
                    province != null && city != null ? province + city : null
                );
            }
        } catch (Exception e) {
            log.error("记录登录日志失败", e);
        }
        
        UserVO userVO = convertToVO(user);
        
        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUser(userVO);
        
        return loginVO;
    }

    @Override
    public void logout() {
        StpUtil.logout();
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
        List<Long> roleIds = userRoleMapper.selectRoleIdsByUserId(user.getId());
        if (roleIds != null && !roleIds.isEmpty()) {
            List<RoleVO> roles = roleService.getByIds(roleIds);
            vo.setRoles(roles);
        }
        return vo;
    }

    private String parseDevice(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "未知设备";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone") || ua.contains("ipad")) {
            return "移动设备";
        }
        if (ua.contains("windows")) {
            return "Windows";
        }
        if (ua.contains("mac")) {
            return "Mac";
        }
        if (ua.contains("linux")) {
            return "Linux";
        }
        return "未知设备";
    }

    private String parseBrowser(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "未知浏览器";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("chrome") && !ua.contains("edg")) {
            return "Chrome";
        }
        if (ua.contains("firefox")) {
            return "Firefox";
        }
        if (ua.contains("safari") && !ua.contains("chrome")) {
            return "Safari";
        }
        if (ua.contains("edg")) {
            return "Edge";
        }
        if (ua.contains("opera")) {
            return "Opera";
        }
        return "未知浏览器";
    }
}

