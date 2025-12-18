package com.blog.util;

import com.blog.annotation.ApiResource;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

@Component
public class ApiResourceScanner {
    private final ApplicationContext applicationContext;

    public ApiResourceScanner(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    public List<ApiResourceInfo> scanApiResources() {
        List<ApiResourceInfo> resources = new ArrayList<>();
        
        String[] beanNames = applicationContext.getBeanNamesForAnnotation(org.springframework.web.bind.annotation.RestController.class);
        
        for (String beanName : beanNames) {
            Object bean = applicationContext.getBean(beanName);
            Class<?> clazz = bean.getClass();
            
            ApiResource apiResource = clazz.getAnnotation(ApiResource.class);
            if (apiResource == null) {
                continue;
            }
            
            RequestMapping classMapping = clazz.getAnnotation(RequestMapping.class);
            String basePath = "";
            if (classMapping != null && classMapping.value().length > 0) {
                basePath = classMapping.value()[0];
            }
            
            Method[] methods = clazz.getDeclaredMethods();
            for (Method method : methods) {
                org.springframework.web.bind.annotation.GetMapping getMapping = method.getAnnotation(org.springframework.web.bind.annotation.GetMapping.class);
                org.springframework.web.bind.annotation.PostMapping postMapping = method.getAnnotation(org.springframework.web.bind.annotation.PostMapping.class);
                org.springframework.web.bind.annotation.PutMapping putMapping = method.getAnnotation(org.springframework.web.bind.annotation.PutMapping.class);
                org.springframework.web.bind.annotation.DeleteMapping deleteMapping = method.getAnnotation(org.springframework.web.bind.annotation.DeleteMapping.class);
                
                String methodType = null;
                String[] paths = null;
                
                if (getMapping != null) {
                    methodType = "GET";
                    paths = getMapping.value();
                } else if (postMapping != null) {
                    methodType = "POST";
                    paths = postMapping.value();
                } else if (putMapping != null) {
                    methodType = "PUT";
                    paths = putMapping.value();
                } else if (deleteMapping != null) {
                    methodType = "DELETE";
                    paths = deleteMapping.value();
                }
                
                if (methodType != null) {
                    String methodPath = paths.length > 0 ? paths[0] : "";
                    String fullPath = basePath + methodPath;
                    
                    ApiResourceInfo info = new ApiResourceInfo();
                    info.setName(apiResource.name());
                    info.setPath(fullPath);
                    info.setMethod(methodType);
                    info.setDescription(apiResource.description());
                    info.setIsOpen(apiResource.isOpen() ? 1 : 0);
                    info.setKey(generateKey(fullPath, methodType));
                    
                    resources.add(info);
                }
            }
        }
        
        return resources;
    }
    
    private String generateKey(String path, String method) {
        return method.toLowerCase() + ":" + path.replace("/", "_").replaceAll("[{}]", "");
    }
    
    public static class ApiResourceInfo {
        private String key;
        private String name;
        private String path;
        private String method;
        private String description;
        private Integer isOpen;
        
        public String getKey() {
            return key;
        }
        
        public void setKey(String key) {
            this.key = key;
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
    }
}

