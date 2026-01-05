package com.blog.shared.annotation;


import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
/**
 * 增强限流注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    
    /**
     * 限流类型
     */
    enum Type {
        SLIDING_WINDOW,  // 滑动窗口
        TOKEN_BUCKET,    // 令牌桶
        FIXED_WINDOW     // 固定窗口
    }
    
    /**
     * 限流维度
     */
    enum Dimension {
        IP,      // 按IP限流
        USER,    // 按用户限流
        API,     // 按API限流
        GLOBAL   // 全局限流
    }
    
    /**
     * 限流类型，默认滑动窗口
     */
    Type type() default Type.SLIDING_WINDOW;
    
    /**
     * 限流维度，默认IP
     */
    Dimension dimension() default Dimension.IP;
    
    /**
     * 时间窗口大小（秒），默认60秒
     */
    int window() default 60;
    
    /**
     * 限制次数，默认100次
     */
    int limit() default 100;
    
    /**
     * 令牌桶容量（仅TOKEN_BUCKET类型有效）
     */
    int capacity() default 100;
    
    /**
     * 令牌补充速率（每秒，仅TOKEN_BUCKET类型有效）
     */
    double refillRate() default 10.0;
    
    /**
     * 自定义限流键前缀
     */
    String keyPrefix() default "";
    
    /**
     * 错误消息
     */
    String message() default "请求过于频繁，请稍后再试";
    
    /**
     * 是否启用，默认启用
     */
    boolean enabled() default true;
}