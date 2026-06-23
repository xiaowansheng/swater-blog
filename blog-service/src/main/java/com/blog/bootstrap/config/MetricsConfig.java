package com.blog.bootstrap.config;


import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics;
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics;
import io.micrometer.core.instrument.binder.system.ProcessorMetrics;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 监控指标配置
 * <p>
 * 移除了已停更的 io.github.mweirauch:micrometer-jvm-extras，
 * 改用 Micrometer 内置的 JVM/进程绑定器，覆盖等价指标：
 * - JvmMemoryMetrics  → jvm.memory.* (堆/非堆内存)
 * - JvmThreadMetrics  → jvm.threads.* (线程数)
 * - ProcessorMetrics  → system.cpu.* / process.cpu.* (CPU)
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

    @Bean
    public MeterBinder jvmMemoryMetrics() {
        return new JvmMemoryMetrics();
    }

    @Bean
    public MeterBinder jvmThreadMetrics() {
        return new JvmThreadMetrics();
    }

    @Bean
    public MeterBinder processorMetrics() {
        return new ProcessorMetrics();
    }
}
