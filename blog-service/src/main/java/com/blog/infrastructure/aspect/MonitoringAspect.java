package com.blog.infrastructure.aspect;



import com.blog.infrastructure.metrics.BlogMetrics;
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
 * 自动为Service、Mapper、Controller层添加性能监控
 */
@Aspect
@Component
public class MonitoringAspect {

    @Autowired
    private BlogMetrics blogMetrics;

    /**
     * 监控所有Service层的查询方法
     */
    @Around("execution(* com.blog.modules..*.service..*Query*.*(..))")
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
            blogMetrics.recordServiceMethod(duration, className, methodName);

            return result;

        } finally {
            // 使用统一的metric名称和标签
            sample.stop(Timer.builder("blog.service.query.duration")
                .description("Service查询方法耗时")
                .tag("class", joinPoint.getTarget().getClass().getSimpleName())
                .tag("method", joinPoint.getSignature().getName())
                .register(blogMetrics.getMeterRegistry()));
        }
    }

    /**
     * 监控所有Mapper层的数据库操作
     */
    @Around("execution(* com.blog.modules..*.mapper..*(..))")
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
            Duration duration = Duration.between(start, Instant.now());
            blogMetrics.recordDatabaseError(
                duration,
                joinPoint.getTarget().getClass().getSimpleName(),
                joinPoint.getSignature().getName(),
                e.getClass().getSimpleName()
            );

            throw e;
        }
    }

    /**
     * 监控Controller层的HTTP请求
     */
    @Around("execution(* com.blog.modules..*.controller..*(..)) || execution(* com.blog.ops.controller..*(..))")
    public Object monitorControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        Instant start = Instant.now();

        try {
            Object result = joinPoint.proceed();

            // 记录成功的请求
            Duration duration = Duration.between(start, Instant.now());
            blogMetrics.recordControllerRequest(
                duration,
                joinPoint.getTarget().getClass().getSimpleName(),
                joinPoint.getSignature().getName(),
                "success"
            );

            return result;

        } catch (Exception e) {
            // 记录失败的请求
            Duration duration = Duration.between(start, Instant.now());
            blogMetrics.recordControllerRequest(
                duration,
                joinPoint.getTarget().getClass().getSimpleName(),
                joinPoint.getSignature().getName(),
                "error",
                "error", e.getClass().getSimpleName()
            );

            throw e;
        }
    }
}