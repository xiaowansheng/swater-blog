package com.blog.util;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
import lombok.Data;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

@Component
public class ApiResourceScanner {
    private final ApplicationContext applicationContext;

    public ApiResourceScanner(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    /**
     * 扫描所有带有 @ApiOperation 注解的控制器和接口方法
     * 返回模块树形结构（模块包含子接口列表）
     */
    public List<ModuleNode> scanApiResources() {
        List<ModuleNode> modules = new ArrayList<>();

        String[] beanNames = applicationContext.getBeanNamesForAnnotation(RestController.class);

        for (String beanName : beanNames) {
            Object bean = applicationContext.getBean(beanName);
            Class<?> clazz = bean.getClass();

            // 处理被代理的类
            if (clazz.getName().contains("$$")) {
                clazz = clazz.getSuperclass();
            }

            ApiOperation moduleOperation = clazz.getAnnotation(ApiOperation.class);
            if (moduleOperation == null) {
                continue;
            }

            // 获取类级别的基础路径
            RequestMapping classMapping = clazz.getAnnotation(RequestMapping.class);
            String basePath = "";
            if (classMapping != null && classMapping.value().length > 0) {
                basePath = classMapping.value()[0];
            }

            // 创建模块节点
            ModuleNode moduleNode = new ModuleNode();
            moduleNode.setApiKey(generateModuleApiKey(basePath));
            moduleNode.setName(moduleOperation.name());
            moduleNode.setDescription(moduleOperation.description());
            moduleNode.setPath(basePath);
            moduleNode.setMethod("MODULE");
            moduleNode.setIsOpen(moduleOperation.open() ? 1 : 0);
            moduleNode.setPerms(moduleOperation.perms());
            moduleNode.setVersion(moduleOperation.version());

            // 判断模块是否开放（用于接口继承）
            boolean moduleOpen = moduleOperation.open();

            // 扫描方法级别的接口
            List<ApiNode> apis = new ArrayList<>();
            Method[] methods = clazz.getDeclaredMethods();
            for (Method method : methods) {
                ApiOperation methodOperation = method.getAnnotation(ApiOperation.class);
                if (methodOperation == null) {
                    continue;
                }

                // 解析 HTTP 方法和路径
                ApiOperation.HttpMethod httpMethod = methodOperation.method();
                String[] operationPaths = methodOperation.path();

                // 如果注解未指定HTTP方法，从Spring映射注解中推断
                String httpMethodStr = httpMethod.toString();
                String[] paths = operationPaths;

                if (httpMethod == ApiOperation.HttpMethod.UNKNOWN) {
                    // 尝试从Spring注解推断
                    GetMapping getMapping = method.getAnnotation(GetMapping.class);
                    PostMapping postMapping = method.getAnnotation(PostMapping.class);
                    PutMapping putMapping = method.getAnnotation(PutMapping.class);
                    DeleteMapping deleteMapping = method.getAnnotation(DeleteMapping.class);
                    PatchMapping patchMapping = method.getAnnotation(PatchMapping.class);

                    if (getMapping != null) {
                        httpMethodStr = "GET";
                        paths = getMapping.value().length > 0 ? getMapping.value() : new String[]{""};
                    } else if (postMapping != null) {
                        httpMethodStr = "POST";
                        paths = postMapping.value().length > 0 ? postMapping.value() : new String[]{""};
                    } else if (putMapping != null) {
                        httpMethodStr = "PUT";
                        paths = putMapping.value().length > 0 ? putMapping.value() : new String[]{""};
                    } else if (deleteMapping != null) {
                        httpMethodStr = "DELETE";
                        paths = deleteMapping.value().length > 0 ? deleteMapping.value() : new String[]{""};
                    } else if (patchMapping != null) {
                        httpMethodStr = "PATCH";
                        paths = patchMapping.value().length > 0 ? patchMapping.value() : new String[]{""};
                    } else {
                        continue; // 没有HTTP映射注解，跳过
                    }
                }

                // 为每个路径创建接口信息
                for (String methodPath : paths) {
                    String fullPath = basePath + methodPath;

                    ApiNode apiNode = new ApiNode();
                    // 生成接口唯一标识
                    String apiKey = generateKey(fullPath, httpMethodStr);
                    apiNode.setApiKey(apiKey);
                    apiNode.setName(methodOperation.name());
                    apiNode.setPath(fullPath);
                    apiNode.setMethod(httpMethodStr);
                    apiNode.setDescription(methodOperation.description());

                    // 处理open属性继承逻辑
                    boolean isOpen = moduleOpen && methodOperation.open();
                    apiNode.setIsOpen(isOpen ? 1 : 0);

                    // 处理权限标识
                    String perms = methodOperation.perms();
                    if (perms == null || perms.isEmpty()) {
                        perms = moduleNode.getApiKey() + ":" + apiKey;
                    }
                    apiNode.setPerms(perms);

                    apiNode.setType(methodOperation.type().name());
                    apiNode.setVersion(methodOperation.version());
                    apiNode.setLogOperation(methodOperation.logOperation());
                    apiNode.setLogException(methodOperation.logException());

                    apis.add(apiNode);
                }
            }

            moduleNode.setApis(apis);
            modules.add(moduleNode);
        }

        return modules;
    }

    /**
     * 生成API key
     * 使用哈希算法确保唯一性
     */
    private String generateKey(String path, String method) {
        // 统一处理路径：去除首尾斜杠，转小写
        String normalizedPath = path.toLowerCase().replaceAll("^/+|/+$", "");

        // 生成唯一标识：方法 + 路径的哈希值
        String pathHash = String.valueOf(Math.abs(normalizedPath.hashCode()));

        return method.toLowerCase() + ":" + pathHash;
    }

    /**
     * 从基础路径生成模块的 apiKey
     * 例如：/api/admin/user → api:admin:user
     */
    private String generateModuleApiKey(String basePath) {
        if (basePath == null || basePath.isEmpty()) {
            return "default";
        }

        // 去除首尾斜杠，按斜杠分割
        String cleanPath = basePath.replaceAll("^/+|/+$", "");
        String[] parts = cleanPath.split("/");

        // 使用路径的第一部分（通常是 api、admin、pub 等）
        if (parts.length > 0) {
            // 将路径转换为 apiKey 格式：/api/admin → api:admin
            return String.join(":", parts);
        }

        return cleanPath;
    }

    /**
     * 模块节点（包含子接口列表）
     */
    @Data
    public static class ModuleNode {
        private String apiKey;
        private String name;
        private String path;
        private String method;
        private String description;
        private Integer isOpen;
        private String perms;
        private String version;
        private List<ApiNode> apis; // 子接口列表
    }

    /**
     * API 接口节点
     */
    @Data
    public static class ApiNode {
        private String apiKey;
        private String name;
        private String path;
        private String method;
        private String description;
        private Integer isOpen;
        private String perms;
        private String type;
        private String version;
        private boolean logOperation;
        private boolean logException;
    }
}

