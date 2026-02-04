package com.blog.bootstrap.config;



import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebMvcConfig.class);

    @Getter
    @Value("${file.storage.local.path:uploads}")
    private String uploadDir;

    @Getter
    @Value("${file.storage.local.url-prefix:/uploads}")
    private String urlPrefix;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置本地上传文件的静态资源映射
        String pathPattern = urlPrefix.endsWith("/") ? urlPrefix + "**" : urlPrefix + "/**";
        
        // 规范化路径，确保在 Windows 上正确解析
        Path absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String location = "file:" + absolutePath.toString().replace("\\", "/") + "/";
        
        logger.info("静态资源映射: {} -> {}", pathPattern, location);
        
        registry.addResourceHandler(pathPattern)
                .addResourceLocations(location);
    }

}

