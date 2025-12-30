package com.blog.interceptor;

import cn.dev33.satoken.exception.NotPermissionException;
import com.blog.cache.ApiResourceCache;
import com.blog.model.vo.RoleVO;
import com.blog.model.vo.UserVO;
import com.blog.context.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * API接口权限拦截器
 * <p>
 * 负责验证用户是否有权限访问指定的API接口
 * </p>
 *
 * @author Claude
 * @since 2025-12-31
 */
@Slf4j
@Component
public class ApiPermissionInterceptor implements HandlerInterceptor {

    @Autowired
    private ApiResourceCache apiResourceCache;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 获取当前请求的路径和方法
        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();

        // 获取当前用户（在之前的拦截器中已经设置）
        UserVO currentUser = UserContext.getCurrentUser();

        // 执行接口权限验证
        return checkApiPermission(requestPath, requestMethod, currentUser);
    }

    /**
     * 检查接口权限
     *
     * @param path       接口路径
     * @param method     HTTP方法
     * @param currentUser 当前用户
     * @return true 表示有权限，false 表示无权限
     */
    private boolean checkApiPermission(String path, String method, UserVO currentUser) {
        // 从缓存中获取接口信息
        ApiResourceCache.ApiResourceInfo apiInfo = apiResourceCache.getApiResource(path, method);

        // 如果在接口列表里找不到对应的接口配置信息，则返回404
        if (apiInfo == null) {
            log.warn("接口不存在: path={}, method={}", path, method);
            throw new com.blog.exception.BusinessException(404, "接口不存在");
        }

        // 检查是否是开放的接口资源
        if (apiInfo.isOpen()) {
            log.debug("开放接口，允许访问: path={}, method={}", path, method);
            return true;
        }

        // 非开放接口，需要验证用户权限
        // 获取接口授权的角色列表
        var authorizedRoleIds = apiResourceCache.getApiRoles(apiInfo.getId());

        // 如果接口没有对应的授权角色，默认需要admin角色
        if (authorizedRoleIds == null || authorizedRoleIds.isEmpty()) {
            log.debug("接口未配置授权角色，默认需要admin角色: path={}, method={}", path, method);
            // 检查用户是否是admin
            if (!"admin".equals(currentUser.getRole())) {
                log.warn("用户无权限访问（非admin）: path={}, method={}, userRole={}",
                        path, method, currentUser.getRole());
                throw new NotPermissionException("无权限访问");
            }
            return true;
        }

        // 检查用户的角色是否匹配接口授权的角色列表
        boolean hasPermission = false;
        if (currentUser.getRoles() != null) {
            for (RoleVO userRole : currentUser.getRoles()) {
                if (userRole != null && authorizedRoleIds.contains(userRole.getId())) {
                    hasPermission = true;
                    break;
                }
            }
        }

        if (!hasPermission) {
            log.warn("用户无权限访问（角色不匹配）: path={}, method={}, userId={}, userRole={}",
                    path, method, currentUser.getId(), currentUser.getRole());
            throw new NotPermissionException("无权限访问");
        }

        log.debug("用户权限验证通过: path={}, method={}, userId={}", path, method, currentUser.getId());
        return true;
    }
}
