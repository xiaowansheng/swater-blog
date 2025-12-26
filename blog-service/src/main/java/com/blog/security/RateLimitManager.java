package com.blog.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Collections;
import java.util.concurrent.TimeUnit;

/**
 * 增强限流管理器
 * 支持多种限流策略：固定窗口、滑动窗口、令牌桶
 */
@Component
public class RateLimitManager {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // 滑动窗口限流Lua脚本
    private static final String SLIDING_WINDOW_SCRIPT = """
        local key = KEYS[1]
        local window = tonumber(ARGV[1])
        local limit = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        
        -- 清除过期的记录
        redis.call('zremrangebyscore', key, 0, now - window * 1000)
        
        -- 获取当前窗口内的请求数
        local current = redis.call('zcard', key)
        
        if current < limit then
            -- 添加当前请求
            redis.call('zadd', key, now, now)
            redis.call('expire', key, window)
            return {1, limit - current - 1}
        else
            return {0, 0}
        end
        """;
    
    // 令牌桶限流Lua脚本
    private static final String TOKEN_BUCKET_SCRIPT = """
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local tokens = tonumber(ARGV[2])
        local interval = tonumber(ARGV[3])
        local now = tonumber(ARGV[4])
        
        local bucket = redis.call('hmget', key, 'tokens', 'last_refill')
        local current_tokens = tonumber(bucket[1]) or capacity
        local last_refill = tonumber(bucket[2]) or now
        
        -- 计算需要添加的令牌数
        local elapsed = now - last_refill
        local tokens_to_add = math.floor(elapsed / interval * tokens)
        current_tokens = math.min(capacity, current_tokens + tokens_to_add)
        
        if current_tokens >= 1 then
            current_tokens = current_tokens - 1
            redis.call('hmset', key, 'tokens', current_tokens, 'last_refill', now)
            redis.call('expire', key, 3600)
            return {1, current_tokens}
        else
            redis.call('hmset', key, 'tokens', current_tokens, 'last_refill', now)
            redis.call('expire', key, 3600)
            return {0, current_tokens}
        end
        """;
    
    /**
     * 滑动窗口限流
     * @param key 限流键
     * @param windowSeconds 窗口大小（秒）
     * @param limit 限制次数
     * @return 是否允许通过
     */
    public RateLimitResult slidingWindowRateLimit(String key, int windowSeconds, int limit) {
        DefaultRedisScript<Object> script = new DefaultRedisScript<>(SLIDING_WINDOW_SCRIPT, Object.class);
        
        Object result = redisTemplate.execute(script, 
            Collections.singletonList(key), 
            windowSeconds, limit, System.currentTimeMillis());
        
        if (result instanceof java.util.List) {
            @SuppressWarnings("unchecked")
            java.util.List<Long> list = (java.util.List<Long>) result;
            boolean allowed = list.get(0) == 1L;
            long remaining = list.get(1);
            return new RateLimitResult(allowed, remaining, windowSeconds);
        }
        
        return new RateLimitResult(false, 0, windowSeconds);
    }
    
    /**
     * 令牌桶限流
     * @param key 限流键
     * @param capacity 桶容量
     * @param refillRate 令牌补充速率（每秒）
     * @return 是否允许通过
     */
    public RateLimitResult tokenBucketRateLimit(String key, int capacity, double refillRate) {
        DefaultRedisScript<Object> script = new DefaultRedisScript<>(TOKEN_BUCKET_SCRIPT, Object.class);
        
        long intervalMs = (long) (1000.0 / refillRate);
        Object result = redisTemplate.execute(script,
            Collections.singletonList(key),
            capacity, 1, intervalMs, System.currentTimeMillis());
        
        if (result instanceof java.util.List) {
            @SuppressWarnings("unchecked")
            java.util.List<Long> list = (java.util.List<Long>) result;
            boolean allowed = list.get(0) == 1L;
            long remaining = list.get(1);
            return new RateLimitResult(allowed, remaining, 60); // 1分钟窗口
        }
        
        return new RateLimitResult(false, 0, 60);
    }
    
    /**
     * 固定窗口限流
     * @param key 限流键
     * @param windowSeconds 窗口大小（秒）
     * @param limit 限制次数
     * @return 是否允许通过
     */
    public RateLimitResult fixedWindowRateLimit(String key, int windowSeconds, int limit) {
        long window = System.currentTimeMillis() / (windowSeconds * 1000);
        String windowKey = key + ":" + window;
        
        Long current = redisTemplate.opsForValue().increment(windowKey);
        if (current == 1) {
            redisTemplate.expire(windowKey, Duration.ofSeconds(windowSeconds));
        }
        
        boolean allowed = current <= limit;
        long remaining = Math.max(0, limit - current);
        
        return new RateLimitResult(allowed, remaining, windowSeconds);
    }
    
    /**
     * IP限流
     * @param ip IP地址
     * @param windowSeconds 窗口大小
     * @param limit 限制次数
     * @return 限流结果
     */
    public RateLimitResult ipRateLimit(String ip, int windowSeconds, int limit) {
        return slidingWindowRateLimit("rate_limit:ip:" + ip, windowSeconds, limit);
    }
    
    /**
     * 用户限流
     * @param userId 用户ID
     * @param windowSeconds 窗口大小
     * @param limit 限制次数
     * @return 限流结果
     */
    public RateLimitResult userRateLimit(Long userId, int windowSeconds, int limit) {
        return slidingWindowRateLimit("rate_limit:user:" + userId, windowSeconds, limit);
    }
    
    /**
     * API限流
     * @param apiPath API路径
     * @param windowSeconds 窗口大小
     * @param limit 限制次数
     * @return 限流结果
     */
    public RateLimitResult apiRateLimit(String apiPath, int windowSeconds, int limit) {
        return slidingWindowRateLimit("rate_limit:api:" + apiPath, windowSeconds, limit);
    }
    
    /**
     * 限流结果
     */
    public static class RateLimitResult {
        private final boolean allowed;
        private final long remaining;
        private final int windowSeconds;
        
        public RateLimitResult(boolean allowed, long remaining, int windowSeconds) {
            this.allowed = allowed;
            this.remaining = remaining;
            this.windowSeconds = windowSeconds;
        }
        
        public boolean isAllowed() {
            return allowed;
        }
        
        public long getRemaining() {
            return remaining;
        }
        
        public int getWindowSeconds() {
            return windowSeconds;
        }
        
        public long getResetTime() {
            return System.currentTimeMillis() + (windowSeconds * 1000L);
        }
    }
}