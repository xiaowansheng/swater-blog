package com.blog.bootstrap.config;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import com.blog.bootstrap.context.UserContext;
import com.blog.infrastructure.interceptor.ApiPermissionInterceptor;
import com.blog.modules.system.role.model.vo.RoleVO;
import com.blog.modules.system.role.service.RoleService;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.user.model.vo.UserVO;
import com.blog.shared.exception.BusinessException;
import com.blog.shared.util.BeanUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * SaToken 配置类
 * <p>
 * 配置登录拦截器，验证用户身份并设置用户上下文。
 * </p>
 */
@Slf4j
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    @Autowired
    private WebMvcConfig webMvcConfig;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleService roleService;

    @Autowired
    private ApiPermissionInterceptor apiPermissionInterceptor;

    @Value("${spring.mvc.servlet.path:}")
    private String servletPath;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // SaToken 登录拦截器 - 负责用户认证和设置用户上下文
        // 直接在 addPathPatterns 中指定需要拦截的路径，避免重复匹配
        registry.addInterceptor(new SaInterceptor(handler -> {
                    // 放行 OPTIONS 请求（CORS 预检请求）
                    if (HttpMethod.OPTIONS.matches(SaHolder.getRequest().getMethod())) {
                        return;
                    }

                    // 检查登录状态
                    StpUtil.checkLogin();
                    // 显式刷新最后活跃时间，确保 active-timeout 为滚动过期
                    StpUtil.updateLastActiveToNow();

                    // 设置用户上下文（每个请求只查询一次数据库）
                    try {
                        Long userId = StpUtil.getLoginIdAsLong();
                        User user = userMapper.selectById(userId);

                        if (user == null || user.getDeleted() == 1) {
                            log.warn("用户不存在或已删除: userId={}", userId);
                            StpUtil.logout();
                            throw new BusinessException("用户不存在");
                        }

                        if (user.getStatus() != null && user.getStatus() == 0) {
                            log.warn("用户已被禁用: userId={}", userId);
                            StpUtil.logout();
                            throw new BusinessException("用户已被禁用");
                        }

                        // 转换为 VO 并设置到上下文
                        UserVO userVO = convertToVO(user);
                        UserContext.setCurrentUser(userVO);

                        log.debug("用户上下文已设置: userId={}, role={}", userId, user.getRoleKey());
                    } catch (Exception e) {
                        log.error("设置用户上下文失败", e);
                        throw e;
                    }
                }))
                .addPathPatterns(
                        "/api/admin/**",
                        "/api/auth/current",
                        "/api/auth/userinfo",
                        "/api/auth/refresh"
                )
                .order(1); // 设置拦截器顺序，先执行

        registry.addInterceptor(apiPermissionInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**")
                .order(2); // 在登录拦截器之后执行
    }

    /**
     * 转换用户实体为 VO
     */
    private UserVO convertToVO(User user) {
        UserVO vo = BeanUtil.copyProperties(user, UserVO.class);
        if (user.getRoleKey() != null && !user.getRoleKey().isEmpty()) {
            // 根据用户的 roleKey 字段获取角色信息
            RoleVO role = roleService.getByName(user.getRoleKey());
            if (role != null) {
                vo.setRoles(List.of(role));
            }
        }
        return vo;
    }
}