package com.blog.bootstrap.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
/**
 * API 资源配置属性
 * <p>
 * 从 application.yml 中读取 api-resource 相关配置
 * </p>
 *
 * @author Claude
 * @since 2025-12-31
 */
@Data
@Component
@ConfigurationProperties(prefix = "api-resource")

public class ApiResourceProperties {

    /**
     * 应用启动时是否自动刷新接口资源
     */
    private boolean autoRefreshOnStartup = true;
}
