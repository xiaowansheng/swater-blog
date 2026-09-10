package com.blog.bootstrap.config;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.core.env.PropertySourcesPropertyResolver;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class BootstrapProfileConfigTest {

    /**
     * 生产/容器 profile 与 dev 一致：管理员凭据全部走环境变量注入，
     * 配置文件中不允许出现硬编码口令（无环境变量时解析为空，
     * 由 DataInitializer.validateBootstrapConfig 在启动时 fail-fast）。
     */
    @ParameterizedTest
    @ValueSource(strings = {"application-docker.yml"})
    void profileProvidesBootstrapAdminPassword(String profileConfig) throws IOException {
        PropertySourcesPropertyResolver resolver = resolverFor(profileConfig);

        // 无环境变量时全部解析为空：证明配置文件未硬编码任何默认口令
        assertThat(resolver.getProperty("blog.bootstrap.admin.username")).isBlank();
        assertThat(resolver.getProperty("blog.bootstrap.admin.password")).isBlank();
        assertThat(resolver.getProperty("blog.bootstrap.admin.email")).isBlank();
    }

    /**
     * 开发 profile 不再硬编码凭据：username/password/email 全部走环境变量，
     * 无环境变量时解析为空字符串（由 DataInitializer.validateBootstrapConfig 在启动时 fail-fast）。
     */
    @Test
    void devProfileDoesNotHardcodeBootstrapCredentials() throws IOException {
        PropertySourcesPropertyResolver resolver = resolverFor("application-dev.yml");

        // 无环境变量时全部解析为空，证明配置文件未硬编码具体值
        assertThat(resolver.getProperty("blog.bootstrap.admin.username")).isBlank();
        assertThat(resolver.getProperty("blog.bootstrap.admin.password")).isBlank();
        assertThat(resolver.getProperty("blog.bootstrap.admin.email")).isBlank();
    }

    @ParameterizedTest
    @ValueSource(strings = {"application-dev.yml", "application-docker.yml"})
    void profileUsesAutoRabbitListenerAcknowledgement(String profileConfig) throws IOException {
        PropertySourcesPropertyResolver resolver = resolverFor(profileConfig);

        String acknowledgeMode = resolver.getProperty("spring.rabbitmq.listener.simple.acknowledge-mode");

        assertThat(acknowledgeMode).isEqualTo("auto");
    }

    private PropertySourcesPropertyResolver resolverFor(String profileConfig) throws IOException {
        YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
        List<PropertySource<?>> sources = loader.load(profileConfig, new ClassPathResource(profileConfig));
        MutablePropertySources propertySources = new MutablePropertySources();
        sources.forEach(propertySources::addLast);
        return new PropertySourcesPropertyResolver(propertySources);
    }
}
