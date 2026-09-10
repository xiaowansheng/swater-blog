package com.blog.bootstrap.config;



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
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 缓存配置
 * <p>
 * 缓存名与业务侧 @Cacheable/@CacheEvict 一一对应（此处只登记实际使用的缓存名）；
 * 各缓存 TTL 在到期时间上加 ±10% 随机抖动，避免同时失效造成缓存雪崩；
 * 允许缓存空值（NullValue），对不存在的 id/页码起到防穿透作用。
 * </p>
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

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper());

        // Key序列化
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Value序列化
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /** Redis 序列化统一使用同一个 ObjectMapper 配置。 */
    private static ObjectMapper redisObjectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
    }

    /**
     * 带随机抖动的 TTL：在基准 TTL 上叠加 ±10% 偏移（按条目计算），
     * 避免同一批 key 同时写入、同时过期。
     */
    private static RedisCacheWriter.TtlFunction jitteredTtl(Duration base) {
        return (key, value) -> {
            long bound = Math.max(1, base.toSeconds() / 10);
            return base.plusSeconds(ThreadLocalRandom.current().nextLong(-bound, bound + 1));
        };
    }

    private static RedisCacheConfiguration config(Duration baseTtl, String prefix) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(jitteredTtl(baseTtl))
                .prefixCacheNameWith(prefix)
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper())));
    }

    /**
     * 缓存管理器配置
     * 为不同业务场景配置不同的缓存策略
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        // 默认缓存配置：30分钟基准 TTL + 抖动
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(jitteredTtl(Duration.ofMinutes(30)))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper())));

        // 不同业务场景的缓存配置（与 @Cacheable/@CacheEvict 实际使用的缓存名保持一致）
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // 文章
        cacheConfigurations.put("article:list", config(Duration.ofMinutes(30), "blog:article:list:"));
        cacheConfigurations.put("article:hot", config(Duration.ofMinutes(30), "blog:article:hot:"));
        cacheConfigurations.put("article:latest", config(Duration.ofMinutes(30), "blog:article:latest:"));
        cacheConfigurations.put("article:related", config(Duration.ofMinutes(30), "blog:article:related:"));

        // 分类/标签：详情变化少用 6 小时，列表用 30 分钟
        cacheConfigurations.put("category", config(Duration.ofHours(6), "blog:category:"));
        cacheConfigurations.put("category:list", config(Duration.ofMinutes(30), "blog:category:list:"));
        cacheConfigurations.put("tag", config(Duration.ofHours(6), "blog:tag:"));
        cacheConfigurations.put("tag:list", config(Duration.ofMinutes(30), "blog:tag:list:"));

        // 用户信息 - 2小时过期
        cacheConfigurations.put("user", config(Duration.ofHours(2), "blog:user:"));

        // 系统配置 - 12小时过期（很少变化，写路径已有精确 evict）
        cacheConfigurations.put("configs", config(Duration.ofHours(12), "blog:config:"));
        // 前台聚合配置缓存
        cacheConfigurations.put("siteConfig", config(Duration.ofMinutes(30), "blog:site:config:"));

        // 说说列表缓存 - 10分钟
        cacheConfigurations.put("talk:list", config(Duration.ofMinutes(10), "blog:talk:list:"));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()  // 支持事务
                .build();
    }
}
