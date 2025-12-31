package com.blog.listener;

import com.blog.config.ApiResourceProperties;
import com.blog.service.ApiResourceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * API 资源初始化器
 * <p>
 * 应用启动后自动刷新接口资源数据
 * </p>
 *
 * @author Claude
 * @since 2025-12-31
 */
@Slf4j
@Component
@Order(100) // 设置较低的优先级，确保在其他组件初始化之后执行
public class ApiResourceInitializer implements ApplicationRunner {

    @Autowired
    private ApiResourceService apiResourceService;

    @Autowired
    private ApiResourceProperties apiResourceProperties;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 根据配置决定是否自动刷新
        if (!apiResourceProperties.isAutoRefreshOnStartup()) {
            log.info("API 资源自动刷新已禁用（api-resource.auto-refresh-on-startup=false）");
            return;
        }

        try {
            log.info("开始初始化 API 接口资源...");
            long startTime = System.currentTimeMillis();

            // 执行刷新操作
            apiResourceService.refresh();

            long endTime = System.currentTimeMillis();
            log.info("API 接口资源初始化完成，耗时: {}ms", endTime - startTime);

        } catch (Exception e) {
            log.error("API 接口资源初始化失败", e);
            // 这里可以根据需求决定是否抛出异常中断启动
            // throw new RuntimeException("API 接口资源初始化失败", e);
        }
    }
}
