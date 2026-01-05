package com.blog.core.context;


import com.blog.common.exception.BusinessException;
import com.blog.modules.user.model.vo.UserVO;
/**
 * 用户上下文 - 存储当前请求的用户信息
 * <p>
 * 使用 ThreadLocal 存储当前请求的用户信息，避免每次都查询数据库
 * </p>
 *
 * @author Claude
 * @since 2025-12-30
 */
public class UserContext {

    /**
     * 使用 ThreadLocal 存储当前请求的用户信息
     */
    private static final ThreadLocal<UserVO> USER_HOLDER = new ThreadLocal<>();

    /**
     * 设置当前用户（通常在拦截器或过滤器中调用）
     *
     * @param user 当前用户信息
     */
    public static void setCurrentUser(UserVO user) {
        if (user == null) {
            throw new IllegalArgumentException("用户信息不能为空");
        }
        USER_HOLDER.set(user);
    }

    /**
     * 获取当前用户
     *
     * @return 当前用户信息
     * @throws BusinessException 如果用户未登录
     */
    public static UserVO getCurrentUser() {
        UserVO user = USER_HOLDER.get();
        if (user == null) {
            throw new BusinessException("用户未登录");
        }
        return user;
    }

    /**
     * 获取当前用户 ID
     *
     * @return 当前用户 ID
     * @throws BusinessException 如果用户未登录
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * 获取当前用户角色
     *
     * @return 当前用户角色标识（如 "admin", "user"）
     * @throws BusinessException 如果用户未登录
     */
    public static String getCurrentUserRole() {
        String role = getCurrentUser().getRole();
        if (role == null || role.isEmpty()) {
            throw new BusinessException("用户角色不存在");
        }
        return role;
    }

    /**
     * 检查当前用户是否有指定角色
     *
     * @param role 角色标识（如 "admin"）
     * @return true 如果有该角色，否则返回 false
     */
    public static boolean hasRole(String role) {
        try {
            return role.equals(getCurrentUserRole());
        } catch (BusinessException e) {
            return false;
        }
    }

    /**
     * 检查当前用户是否是管理员
     *
     * @return true 如果是管理员，否则返回 false
     */
    public static boolean isAdmin() {
        return hasRole("admin");
    }

    /**
     * 检查用户是否已登录
     *
     * @return true 如果已登录，否则返回 false
     */
    public static boolean isLoggedIn() {
        return USER_HOLDER.get() != null;
    }

    /**
     * 清除当前用户（请求结束时调用，防止内存泄漏）
     */
    public static void clear() {
        USER_HOLDER.remove();
    }
}
