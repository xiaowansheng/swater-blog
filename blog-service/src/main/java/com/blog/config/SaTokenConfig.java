package com.blog.config;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.router.SaRouter;
import cn.dev33.satoken.stp.StpUtil;
import com.blog.context.UserContext;
import com.blog.interceptor.ApiPermissionInterceptor;
import com.blog.mapper.UserMapper;
import com.blog.model.entity.User;
import com.blog.model.vo.RoleVO;
import com.blog.model.vo.UserVO;
import com.blog.service.RoleService;
import com.blog.util.BeanUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * SaToken 配置类
 * <p>
 * 配置登录拦截器，验证用户身份并设置用户上下文
 * </p>
 */
@Slf4j
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoleService roleService;

    @Autowired
    private ApiPermissionInterceptor apiPermissionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // SaToken 登录拦截器 - 负责用户认证和设置用户上下文
        registry.addInterceptor(new SaInterceptor(handler -> {
            // 登录校验 -- 拦截所有 admin 接口和需要认证的auth接口
            SaRouter.match("/api/admin/**", "/api/auth/current", "/api/auth/userinfo", "/api/auth/refresh")
                    .check(r -> {
                        // 放行 OPTIONS 请求（CORS 预检请求）
                        if (HttpMethod.OPTIONS.matches(SaHolder.getRequest().getMethod())) {
                            return;
                        }

                        // 检查登录状态
                        StpUtil.checkLogin();

                        // 设置用户上下文（每个请求只查一次数据库）
                        try {
                            Long userId = StpUtil.getLoginIdAsLong();
                            User user = userMapper.selectById(userId);

                            if (user == null || user.getDeleted() == 1) {
                                log.warn("用户不存在或已删除: userId={}", userId);
                                StpUtil.logout();
                                throw new com.blog.exception.BusinessException("用户不存在");
                            }

                            if (user.getStatus() != null && user.getStatus() == 0) {
                                log.warn("用户已被禁用: userId={}", userId);
                                StpUtil.logout();
                                throw new com.blog.exception.BusinessException("用户已被禁用");
                            }

                            // 转换为 VO 并设置到上下文
                            UserVO userVO = convertToVO(user);
                            UserContext.setCurrentUser(userVO);

                            log.debug("用户上下文已设置: userId={}, role={}", userId, user.getRole());
                        } catch (Exception e) {
                            log.error("设置用户上下文失败", e);
                            throw e;
                        }
                    });
        })).addPathPatterns("/**")
          .order(1); // 设置拦截器顺序，先执行

        // API权限拦截器 - 负责接口权限验证
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
        if (user.getRole() != null && !user.getRole().isEmpty()) {
            // 根据用户的 role 字段获取角色信息
            RoleVO role = roleService.getByName(user.getRole());
            if (role != null) {
                vo.setRoles(List.of(role));
            }
        }
        return vo;
    }
}

