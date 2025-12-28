package com.blog.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * 缓存配置优化
 * 实现多级缓存和不同业务场景的缓存策略
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * 自定义RedisTemplate配置
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        
        // 配置序列化器
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
        objectMapper.registerModule(new JavaTimeModule());
        
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);
        
        // Key序列化
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Value序列化
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * 缓存管理器配置
     * 为不同业务场景配置不同的缓存策略
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        // 配置序列化器
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
        objectMapper.registerModule(new JavaTimeModule());
        
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);
        
        // 默认缓存配置
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))  // 默认30分钟过期
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer))
                .disableCachingNullValues();  // 不缓存null值
        
        // 不同业务场景的缓存配置
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // 文章缓存 - 1小时过期
        cacheConfigurations.put("articles", defaultConfig
                .entryTtl(Duration.ofHours(1))
                .prefixCacheNameWith("blog:article:"));
        
        // 文章列表缓存 - 15分钟过期（更新频繁）
        cacheConfigurations.put("article-list", defaultConfig
                .entryTtl(Duration.ofMinutes(15))
                .prefixCacheNameWith("blog:article:list:"));
        
        // 热门文章缓存 - 30分钟过期
        cacheConfigurations.put("hot-articles", defaultConfig
                .entryTtl(Duration.ofMinutes(30))
                .prefixCacheNameWith("blog:article:hot:"));
        
        // 分类缓存 - 6小时过期（变化较少）
        cacheConfigurations.put("categories", defaultConfig
                .entryTtl(Duration.ofHours(6))
                .prefixCacheNameWith("blog:category:"));
        
        // 标签缓存 - 6小时过期
        cacheConfigurations.put("tags", defaultConfig
                .entryTtl(Duration.ofHours(6))
                .prefixCacheNameWith("blog:tag:"));
        
        // 用户信息缓存 - 2小时过期
        cacheConfigurations.put("users", defaultConfig
                .entryTtl(Duration.ofHours(2))
                .prefixCacheNameWith("blog:user:"));
        
        // 评论缓存 - 30分钟过期
        cacheConfigurations.put("comments", defaultConfig
                .entryTtl(Duration.ofMinutes(30))
                .prefixCacheNameWith("blog:comment:"));
        
        // 系统配置缓存 - 12小时过期（很少变化）
        cacheConfigurations.put("configs", defaultConfig
                .entryTtl(Duration.ofHours(12))
                .prefixCacheNameWith("blog:config:"));
        
        // 统计数据缓存 - 5分钟过期（实时性要求高）
        cacheConfigurations.put("statistics", defaultConfig
                .entryTtl(Duration.ofMinutes(5))
                .prefixCacheNameWith("blog:stats:"));
        
        // 搜索结果缓存 - 10分钟过期
        cacheConfigurations.put("search", defaultConfig
                .entryTtl(Duration.ofMinutes(10))
                .prefixCacheNameWith("blog:search:"));
        
        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()  // 支持事务
                .build();
    }
}