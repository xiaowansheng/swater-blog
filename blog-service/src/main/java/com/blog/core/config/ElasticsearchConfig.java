package com.blog.core.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Enable Elasticsearch repositories in the correct package.
 */
@Configuration
@EnableElasticsearchRepositories(basePackages = "com.blog.core.repository")
public class ElasticsearchConfig {
}

