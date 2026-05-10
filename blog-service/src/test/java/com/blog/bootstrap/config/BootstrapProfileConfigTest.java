package com.blog.bootstrap.config;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.core.env.PropertySourcesPropertyResolver;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class BootstrapProfileConfigTest {

    @ParameterizedTest
    @ValueSource(strings = {"application-dev.yml", "application-docker.yml"})
    void profileProvidesBootstrapAdminPassword(String profileConfig) throws IOException {
        PropertySourcesPropertyResolver resolver = resolverFor(profileConfig);

        String password = resolver.getProperty("blog.bootstrap.admin.password");

        assertThat(password).isNotBlank();
        assertThat(password).doesNotContain("${");
    }

    private PropertySourcesPropertyResolver resolverFor(String profileConfig) throws IOException {
        YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
        List<PropertySource<?>> sources = loader.load(profileConfig, new ClassPathResource(profileConfig));
        MutablePropertySources propertySources = new MutablePropertySources();
        sources.forEach(propertySources::addLast);
        return new PropertySourcesPropertyResolver(propertySources);
    }
}
