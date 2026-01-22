package com.blog.infrastructure.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(AppCorsProperties.class)
public class WebCorsConfig implements WebMvcConfigurer {
    private final AppCorsProperties properties;

    public WebCorsConfig(AppCorsProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (!properties.isEnabled()) {
            return;
        }

        registry.addMapping("/**")
            .allowedOrigins(properties.getAllowedOrigins().toArray(new String[0]))
            .allowedMethods(properties.getAllowedMethods().toArray(new String[0]))
            .allowedHeaders(properties.getAllowedHeaders().toArray(new String[0]))
            .exposedHeaders(properties.getExposedHeaders().toArray(new String[0]))
            .allowCredentials(properties.isAllowCredentials());
    }
}

