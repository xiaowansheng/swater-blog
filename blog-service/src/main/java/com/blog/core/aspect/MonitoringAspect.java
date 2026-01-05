package com.blog.core.aspect;



import com.blog.core.metrics.BlogMetrics;
import io.micrometer.core.instrument.Timer;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Instant;
/**
 * 监控切面
 * 自动为Service层方法添加性能监控
 */
@Aspect
@Component
public class MonitoringAspect {
    
    @Autowired
    private BlogMetrics blogMetrics;
    
    /**
     * 监控所有Service层的查询方法
     */
    @Around("execution(* com.blog.service..*Query*.*(..))")
    public Object monitorQueryMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        Instant start = Instant.now();
        Timer.Sample sample = blogMetrics.startTimer();
        
        try {
            Object result = joinPoint.proceed();
            
            // 记录查询耗时
            Duration duration = Duration.between(start, Instant.now());
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            
            blogMetrics.recordArticleQuery(duration, className + "." + methodName);
            
            return result;
            
        } finally {
            sample.stop(Timer.builder("blog.service.query.duration")
                .description("Service查询方法耗时")
                .tag("class", joinPoint.getTarget().getClass().getSimpleName())
                .tag("method", joinPoint.getSignature().getName())
                .register(io.micrometer.core.instrument.Metrics.globalRegistry));
        }
    }
    
    /**
     * 监控所有Mapper层的数据库操作
     */
    @Around("execution(* com.blog.mapper..*(..))")
    public Object monitorMapperMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        Instant start = Instant.now();
        
        try {
            Object result = joinPoint.proceed();
            
            // 记录数据库操作耗时
            Duration duration = Duration.between(start, Instant.now());
            String methodName = joinPoint.getSignature().getName();
            String mapperName = joinPoint.getTarget().getClass().getSimpleName();
            
            // 推断操作类型
            String operation = "select";
            if (methodName.startsWith("insert")) {
                operation = "insert";
            } else if (methodName.startsWith("update")) {
                operation = "update";
            } else if (methodName.startsWith("delete")) {
                operation = "delete";
            }
            
            // 推断表名
            String table = mapperName.replace("Mapper", "").toLowerCase();
            
            blogMetrics.recordDatabaseQuery(duration, operation, table);
            
            return result;
            
        } catch (Exception e) {
            // 记录数据库错误
            Timer.builder("blog.database.error")
                .description("数据库操作错误")
                .tag("mapper", joinPoint.getTarget().getClass().getSimpleName())
                .tag("method", joinPoint.getSignature().getName())
                .tag("error", e.getClass().getSimpleName())
                .register(io.micrometer.core.instrument.Metrics.globalRegistry)
                .record(Duration.between(start, Instant.now()));
            
            throw e;
        }
    }
    
    /**
     * 监控Controller层的HTTP请求
     */
    @Around("execution(* com.blog.controller..*(..))")
    public Object monitorControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        Timer.Sample sample = Timer.start();
        
        try {
            Object result = joinPoint.proceed();
            
            // 记录成功的请求
            sample.stop(Timer.builder("blog.controller.request.duration")
                .description("Controller请求处理耗时")
                .tag("controller", joinPoint.getTarget().getClass().getSimpleName())
                .tag("method", joinPoint.getSignature().getName())
                .tag("status", "success")
                .register(io.micrometer.core.instrument.Metrics.globalRegistry));
            
            return result;
            
        } catch (Exception e) {
            // 记录失败的请求
            sample.stop(Timer.builder("blog.controller.request.duration")
                .description("Controller请求处理耗时")
                .tag("controller", joinPoint.getTarget().getClass().getSimpleName())
                .tag("method", joinPoint.getSignature().getName())
                .tag("status", "error")
                .tag("error", e.getClass().getSimpleName())
                .register(io.micrometer.core.instrument.Metrics.globalRegistry));
            
            throw e;
        }
    }
}