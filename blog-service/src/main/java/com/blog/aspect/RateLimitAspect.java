package com.blog.aspect;

import com.blog.annotation.RateLimit;
import com.blog.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Aspect
@Component
public class RateLimitAspect {
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    @Around("@annotation(rateLimit)")
    public Object around(ProceedingJoinPoint point, RateLimit rateLimit) throws Throwable {
        String key = point.getSignature().toLongString();
        AtomicInteger counter = counters.computeIfAbsent(key, k -> new AtomicInteger(0));
        
        if (counter.incrementAndGet() > rateLimit.qps()) {
            throw new BusinessException(429, "请求过于频繁");
        }
        
        try {
            return point.proceed();
        } finally {
            counter.decrementAndGet();
        }
    }
}

