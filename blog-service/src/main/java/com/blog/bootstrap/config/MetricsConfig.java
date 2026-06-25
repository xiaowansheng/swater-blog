package com.blog.bootstrap.config;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 监控指标配置。
 * <p>
 * JVM/进程指标（jvm.memory.*、jvm.threads.*、system.cpu.*、process.cpu.* 等）由
 * Spring Boot Actuator 的 {@code JvmMetricsAutoConfiguration} 等自动配置类默认注册，
 * 无需在此重复声明——历史上手动注册的 JvmMemoryMetrics/JvmThreadMetrics/ProcessorMetrics
 * 与自动配置的 bean 同名（jvmMemoryMetrics 等），在 docker profile 下触发
 * BeanDefinitionOverrideException 导致启动失败。
 * <p>
 * 此处仅保留通用的 {@code metricsCommonTags}，为所有指标附加 application/version 标签。
 */
@Configuration
public class MetricsConfig {

    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config().commonTags(
            "application", "blog-service",
            "version", "1.0.0"
        );
    }
}
