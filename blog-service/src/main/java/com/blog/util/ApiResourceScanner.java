package com.blog.util;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
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
     * 返回模块（类级别）和接口（方法级别）信息
     */
    public List<ApiResourceInfo> scanApiResources() {
        List<ApiResourceInfo> resources = new ArrayList<>();

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

            // 添加模块信息（类级别）
            ApiResourceInfo moduleInfo = new ApiResourceInfo();
            moduleInfo.setModule(true);
            moduleInfo.setApiKey(moduleOperation.value());
            moduleInfo.setName(moduleOperation.name());
            moduleInfo.setDescription(moduleOperation.description());
            moduleInfo.setPath(basePath);
            moduleInfo.setMethod("MODULE");
            moduleInfo.setIsOpen(moduleOperation.open() ? 1 : 0);
            moduleInfo.setPerms(moduleOperation.perms());
            moduleInfo.setVersion(moduleOperation.version());
            resources.add(moduleInfo);

            // 判断模块是否开放（用于接口继承）
            boolean moduleOpen = moduleOperation.open();

            // 扫描方法级别的接口
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

                    ApiResourceInfo info = new ApiResourceInfo();
                    info.setModule(false);

                    // 生成接口唯一标识
                    String apiKey = methodOperation.value();
                    if (apiKey == null || apiKey.isEmpty()) {
                        apiKey = generateKey(fullPath, httpMethodStr);
                    }
                    info.setApiKey(apiKey);
                    info.setName(methodOperation.name());
                    info.setPath(fullPath);
                    info.setMethod(httpMethodStr);
                    info.setDescription(methodOperation.description());

                    // 处理open属性继承逻辑：
                    // 1. 如果模块不开放，则接口也不开放
                    // 2. 如果模块开放，但接口明确设置为不开放，则接口不开放
                    // 3. 否则接口开放
                    boolean isOpen = moduleOpen && methodOperation.open();
                    info.setIsOpen(isOpen ? 1 : 0);

                    // 处理权限标识
                    String perms = methodOperation.perms();
                    if (perms == null || perms.isEmpty()) {
                        // 自动生成权限标识：模块:操作
                        perms = moduleOperation.value() + ":" + methodOperation.value();
                    }
                    info.setPerms(perms);

                    info.setType(methodOperation.type().name());
                    info.setVersion(methodOperation.version());
                    info.setLogOperation(methodOperation.logOperation());
                    info.setLogException(methodOperation.logException());

                    resources.add(info);
                }
            }
        }

        return resources;
    }

    /**
     * 生成API key
     */
    private String generateKey(String path, String method) {
        return method.toLowerCase() + ":" + path.replace("/", "_").replaceAll("[{}]", "");
    }
    
    public static class ApiResourceInfo {
        private String apiKey;
        private String name;
        private String path;
        private String method;
        private String description;
        private Integer isOpen;
        private boolean module; // 是否为模块（类级别）
        private String perms; // 权限标识
        private String type; // 操作类型
        private String version; // 版本
        private boolean logOperation; // 是否记录操作日志
        private boolean logException; // 是否记录异常日志

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public String getMethod() {
            return method;
        }

        public void setMethod(String method) {
            this.method = method;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Integer getIsOpen() {
            return isOpen;
        }

        public void setIsOpen(Integer isOpen) {
            this.isOpen = isOpen;
        }

        public boolean isModule() {
            return module;
        }

        public void setModule(boolean module) {
            this.module = module;
        }

        public String getPerms() {
            return perms;
        }

        public void setPerms(String perms) {
            this.perms = perms;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getVersion() {
            return version;
        }

        public void setVersion(String version) {
            this.version = version;
        }

        public boolean isLogOperation() {
            return logOperation;
        }

        public void setLogOperation(boolean logOperation) {
            this.logOperation = logOperation;
        }

        public boolean isLogException() {
            return logException;
        }

        public void setLogException(boolean logException) {
            this.logException = logException;
        }
    }
}

