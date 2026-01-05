package com.blog.core.listener;

import com.blog.core.config.ApiResourceProperties;
import com.blog.modules.system.api.service.ApiResourceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * API resource initializer.
 * Runs after application startup to refresh API metadata when enabled.
 */
@Slf4j
@Component
@Order(100) // Low priority to run after other components
public class ApiResourceInitializer implements ApplicationRunner {

    @Autowired
    private ApiResourceService apiResourceService;

    @Autowired
    private ApiResourceProperties apiResourceProperties;

    @Override
    public void run(ApplicationArguments args) {
        if (!apiResourceProperties.isAutoRefreshOnStartup()) {
            log.info("API resource auto refresh disabled (api-resource.auto-refresh-on-startup=false)");
            return;
        }

        try {
            log.info("Starting API resource initialization...");
            long startTime = System.currentTimeMillis();

            apiResourceService.refresh();

            long endTime = System.currentTimeMillis();
            log.info("API resource initialization completed in {}ms", endTime - startTime);
        } catch (Exception e) {
            log.error("API resource initialization failed", e);
            // throw new RuntimeException("API resource initialization failed", e);
        }
    }
}
