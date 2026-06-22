package com.blog.bootstrap.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Elasticsearch 仓库扫描配置。
 * 仅当 plugin.search.active=elasticsearch 时启用，避免 database 模式下
 * 创建 ES Repository 代理并触发 ES 连接。
 */
@Configuration
@EnableElasticsearchRepositories(basePackages = "com.blog.infrastructure.repository")
@ConditionalOnProperty(name = "plugin.search.active", havingValue = "elasticsearch")
public class ElasticsearchConfig {
}
