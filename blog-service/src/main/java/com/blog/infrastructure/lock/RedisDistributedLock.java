package com.blog.infrastructure.lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 基于 Redis 的轻量级分布式锁。
 *
 * - 加锁：SET key value NX EX（原子）
 * - 释放：Lua 脚本比对 value 后删除，避免误删他人持有的锁
 * - Redis 不可用时降级为「获取失败」，由调用方决定是否执行，避免锁服务故障导致行为不一致
 *
 * 适用于对一致性有要求但容忍偶发失败的短任务（如定时任务跨实例去重）。
 */
@Component
public class RedisDistributedLock {

    private static final Logger logger = LoggerFactory.getLogger(RedisDistributedLock.class);

    private static final String UNLOCK_SCRIPT = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
                return redis.call('del', KEYS[1])
            else
                return 0
            end
            """;

    private static final DefaultRedisScript<Long> UNLOCK = new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class);

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 尝试获取锁，成功返回 token，失败返回 null。
     *
     * @param key       锁 key
     * @param leaseTime 持有时长（需大于任务预期执行时间，避免业务未完成锁先过期）
     */
    public String tryLock(String key, Duration leaseTime) {
        String token = UUID.randomUUID().toString();
        try {
            Boolean ok = redisTemplate.opsForValue()
                    .setIfAbsent(key, token, leaseTime.toSeconds(), TimeUnit.SECONDS);
            return Boolean.TRUE.equals(ok) ? token : null;
        } catch (Exception e) {
            logger.warn("获取分布式锁异常，降级为获取失败: key={}, err={}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 释放锁（仅当 token 匹配时生效）。
     */
    public void unlock(String key, String token) {
        if (token == null) {
            return;
        }
        try {
            redisTemplate.execute(UNLOCK, Collections.singletonList(key), token);
        } catch (Exception e) {
            logger.warn("释放分布式锁异常: key={}, err={}", key, e.getMessage());
        }
    }

    /**
     * 在持锁期间执行任务。获取不到锁时返回 null（表示由其他实例处理）。
     */
    public <T> T executeWithLock(String key, Duration leaseTime, Supplier<T> action) {
        String token = tryLock(key, leaseTime);
        if (token == null) {
            return null;
        }
        try {
            return action.get();
        } finally {
            unlock(key, token);
        }
    }
}
