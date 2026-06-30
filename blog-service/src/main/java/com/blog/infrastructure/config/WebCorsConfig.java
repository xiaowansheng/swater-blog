package com.blog.infrastructure.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Configuration
@EnableConfigurationProperties({AppCorsProperties.class, FileUploadProperties.class})
public class WebCorsConfig {
    private static final Logger log = LoggerFactory.getLogger(WebCorsConfig.class);
    private final AppCorsProperties properties;

    public WebCorsConfig(AppCorsProperties properties) {
        this.properties = properties;
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        log.info("Configuring CorsFilter... Enabled: {}", properties.isEnabled());
        
        // 不论是否启用，对于本地开发环境，我们强制注入默认的 CORS 配置，
        // 避免因为开发环境没有正确激活 dev profile 导致前台无法联调。
        if (!properties.isEnabled()) {
            log.warn("CORS properties are disabled! Forcing local development defaults to prevent CORS errors.");
        }
        
        log.info("CORS Allowed Origins: {}", properties.getAllowedOrigins());
        log.info("CORS Allowed Methods: {}", properties.getAllowedMethods());
        
        config.setAllowCredentials(properties.isAllowCredentials());
        
        if (properties.getAllowedOrigins() != null && !properties.getAllowedOrigins().isEmpty()) {
            config.setAllowedOrigins(properties.getAllowedOrigins());
        } else {
            // 如果为空，初始化一个空列表避免后续添加失败（但 Spring CorsConfiguration 会自己处理）
        }
        
        // 如果是被强制启用的（原本没启用），或者包含了开发特征，强制加入本地开发白名单
        if (!properties.isEnabled()) {
            config.addAllowedOriginPattern("http://localhost:*");
            config.addAllowedOriginPattern("http://127.0.0.1:*");
            config.addAllowedOriginPattern("http://192.168.*:*");
        }
        
        if (properties.getAllowedMethods() != null && !properties.getAllowedMethods().isEmpty()) {
            List<String> methods = new java.util.ArrayList<>(properties.getAllowedMethods());
            if (!methods.contains("OPTIONS")) {
                methods.add("OPTIONS");
            }
            config.setAllowedMethods(methods);
        } else {
            config.addAllowedMethod("*");
        }
        
        if (properties.getAllowedHeaders() != null && !properties.getAllowedHeaders().isEmpty()) {
            config.setAllowedHeaders(properties.getAllowedHeaders());
        } else {
            config.addAllowedHeader("*");
        }
        
        if (properties.getExposedHeaders() != null && !properties.getExposedHeaders().isEmpty()) {
            config.setExposedHeaders(properties.getExposedHeaders());
        }

        source.registerCorsConfiguration("/**", config);
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}

