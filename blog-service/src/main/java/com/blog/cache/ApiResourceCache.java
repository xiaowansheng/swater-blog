package com.blog.cache;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.mapper.RoleApiMapper;
import com.blog.mapper.SysApiMapper;
import com.blog.model.entity.SysApi;
import com.blog.model.entity.RoleApi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * API接口资源缓存管理器
 * <p>
 * 负责缓存和管理API接口资源信息，支持动态加载和清除
 * </p>
 *
 * @author Claude
 * @since 2025-12-31
 */
@Slf4j
@Component
public class ApiResourceCache {

    @Autowired
    private SysApiMapper sysApiMapper;

    @Autowired
    private RoleApiMapper roleApiMapper;

    /**
     * 路径匹配器（支持 Ant 风格的路径模式）
     */
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * 接口资源缓存列表
     */
    private final List<ApiResourceInfo> resourceCache = new CopyOnWriteArrayList<>();

    /**
     * 接口角色授权缓存：key = apiId, value = Set<roleId>
     */
    private final Map<Long, Set<Long>> apiRoleCache = new ConcurrentHashMap<>();

    /**
     * 缓存是否已初始化
     */
    private volatile boolean initialized = false;

    /**
     * TODO 如果后续需要优化，可以考虑：
     *          按路径前缀分组建立索引
     *          使用编译后的路径模式（AntPathMatcher 支持编译）
     * 获取接口资源信息
     * <p>
     * 使用路径匹配查找接口（支持占位符等）
     * </p>
     *
     * @param path   接口路径
     * @param method HTTP方法
     * @return 接口资源信息，如果不存在则返回 null
     */
    public ApiResourceInfo getApiResource(String path, String method) {
        ensureInitialized();

        // 遍历所有接口资源，使用路径匹配查找
        for (ApiResourceInfo info : resourceCache) {
            if (info.getPath() != null && info.getMethod() != null) {
                // 使用 Ant 路径匹配器进行匹配
                if (pathMatcher.match(info.getPath(), path) &&
                        info.getMethod().equalsIgnoreCase(method)) {
                    return info;
                }
            }
        }

        return null;
    }

    /**
     * 获取接口授权的角色ID列表
     *
     * @param apiId 接口ID
     * @return 角色ID集合
     */
    public Set<Long> getApiRoles(Long apiId) {
        ensureInitialized();
        return apiRoleCache.getOrDefault(apiId, Collections.<Long>emptySet());
    }

    /**
     * 清除缓存
     * <p>
     * 在接口信息更新时调用，等待下一次访问时重新加载
     * </p>
     */
    public void clear() {
        log.info("清除API接口资源缓存");
        resourceCache.clear();
        apiRoleCache.clear();
        initialized = false;
    }

    /**
     * 确保缓存已初始化
     */
    private void ensureInitialized() {
        if (!initialized) {
            synchronized (this) {
                if (!initialized) {
                    loadCache();
                    initialized = true;
                    log.info("API接口资源缓存初始化完成，共加载 {} 个接口", resourceCache.size());
                }
            }
        }
    }

    /**
     * 从数据库加载接口资源到缓存
     */
    private void loadCache() {
        // 查询所有的接口，去除模块
        LambdaQueryWrapper<SysApi> wrapper = new LambdaQueryWrapper<>();
        wrapper
                .eq(SysApi::getParentId, 0)
                .or()
                .eq(SysApi::getParentId, null);
        List<SysApi> apis = sysApiMapper.selectList(wrapper);

        // 清空缓存
        resourceCache.clear();
        apiRoleCache.clear();

        // 构建接口资源缓存
        for (SysApi api : apis) {
            // 只缓存非模块的接口（模块的 is_open 可能为 null）
            if (api.getMethod() != null) {
                ApiResourceInfo info = new ApiResourceInfo(
                        api.getId(),
                        api.getApiKey(),
                        api.getName(),
                        api.getPath(),
                        api.getMethod(),
                        api.getDescription(),
                        api.getIsOpen()
                );
                resourceCache.add(info);
            }
        }

        // 查询接口角色授权关系
        LambdaQueryWrapper<RoleApi> roleWrapper = new LambdaQueryWrapper<>();
        List<RoleApi> roleApis = roleApiMapper.selectList(roleWrapper);

        // 构建接口角色授权缓存
        for (RoleApi roleApi : roleApis) {
            apiRoleCache.computeIfAbsent(roleApi.getApiId(), k -> new HashSet<>())
                    .add(roleApi.getRoleId());
        }
    }

    /**
     * 接口资源信息
     */
    public static class ApiResourceInfo {
        private final Long id;
        private final String apiKey;
        private final String name;
        private final String path;
        private final String method;
        private final String description;
        private final Integer isOpen;

        public ApiResourceInfo(Long id, String apiKey, String name, String path,
                               String method, String description, Integer isOpen) {
            this.id = id;
            this.apiKey = apiKey;
            this.name = name;
            this.path = path;
            this.method = method;
            this.description = description;
            this.isOpen = isOpen;
        }

        public Long getId() {
            return id;
        }

        public String getApiKey() {
            return apiKey;
        }

        public String getName() {
            return name;
        }

        public String getPath() {
            return path;
        }

        public String getMethod() {
            return method;
        }

        public String getDescription() {
            return description;
        }

        public Integer getIsOpen() {
            return isOpen;
        }

        /**
         * 判断是否为开放接口
         */
        public boolean isOpen() {
            return isOpen != null && isOpen == 1;
        }
    }
}
