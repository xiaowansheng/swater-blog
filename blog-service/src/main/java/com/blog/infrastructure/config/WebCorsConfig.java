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

        // 显式关闭时不注册任何 CORS 规则（同源部署走 nginx 反代即可）。
        // 不再做"禁用时强制注入本地开发白名单"的兜底——那会向 192.168.* 等内网源放开带凭据的跨域。
        if (!properties.isEnabled()) {
            return new FilterRegistrationBean<>();
        }

        log.info("CORS Allowed Origins: {}", properties.getAllowedOrigins());
        log.info("CORS Allowed Methods: {}", properties.getAllowedMethods());

        config.setAllowCredentials(properties.isAllowCredentials());

        if (properties.getAllowedOrigins() != null && !properties.getAllowedOrigins().isEmpty()) {
            config.setAllowedOrigins(properties.getAllowedOrigins());
        } else {
            // 如果为空，初始化一个空列表避免后续添加失败（但 Spring CorsConfiguration 会自己处理）
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

