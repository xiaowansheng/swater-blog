package com.blog.infrastructure.aspect;



import com.blog.shared.annotation.RateLimit;
import com.blog.shared.exception.BusinessException;
import com.blog.infrastructure.security.RateLimitManager;
import com.blog.shared.util.ClientIpResolver;
import cn.dev33.satoken.stp.StpUtil;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
/**
 * 限流切面
 */
@Aspect
@Component
public class RateLimitAspect {
    
    @Autowired
    private RateLimitManager rateLimitManager;

    @Autowired
    private ClientIpResolver clientIpResolver;
    
    @Around("@annotation(rateLimit)")
    public Object around(ProceedingJoinPoint point, RateLimit rateLimit) throws Throwable {
        if (!rateLimit.enabled()) {
            return point.proceed();
        }
        
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return point.proceed();
        }
        
        HttpServletRequest request = attributes.getRequest();
        HttpServletResponse response = attributes.getResponse();
        
        // 生成限流键
        String key = generateRateLimitKey(request, point, rateLimit);
        
        // 执行限流检查
        RateLimitManager.RateLimitResult result = executeRateLimit(key, rateLimit);
        
        if (!result.isAllowed()) {
            // 设置响应头
            if (response != null) {
                response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimit.limit()));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemaining()));
                response.setHeader("X-RateLimit-Reset", String.valueOf(result.getResetTime()));
            }
            
            throw new BusinessException(429, rateLimit.message());
        }
        
        // 设置成功响应头
        if (response != null) {
            response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimit.limit()));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemaining()));
            response.setHeader("X-RateLimit-Reset", String.valueOf(result.getResetTime()));
        }
        
        return point.proceed();
    }
    
    /**
     * 生成限流键
     */
    private String generateRateLimitKey(HttpServletRequest request, ProceedingJoinPoint point, RateLimit rateLimit) {
        StringBuilder keyBuilder = new StringBuilder();
        
        // 添加前缀
        if (!rateLimit.keyPrefix().isEmpty()) {
            keyBuilder.append(rateLimit.keyPrefix()).append(":");
        } else {
            keyBuilder.append("rate_limit:");
        }
        
        // 根据维度生成键
        switch (rateLimit.dimension()) {
            case IP:
                keyBuilder.append("ip:").append(clientIpResolver.resolve(request));
                break;
            case USER:
                // 从请求中获取用户ID（需要根据实际认证方式调整）
                String userId = getUserId(request);
                keyBuilder.append("user:").append(userId != null ? userId : "anonymous");
                break;
            case API:
                keyBuilder.append("api:").append(request.getRequestURI());
                break;
            case GLOBAL:
                keyBuilder.append("global:").append(point.getSignature().getName());
                break;
        }
        
        return keyBuilder.toString();
    }
    
    /**
     * 执行限流检查
     */
    private RateLimitManager.RateLimitResult executeRateLimit(String key, RateLimit rateLimit) {
        switch (rateLimit.type()) {
            case SLIDING_WINDOW:
                return rateLimitManager.slidingWindowRateLimit(key, rateLimit.window(), rateLimit.limit());
            case TOKEN_BUCKET:
                return rateLimitManager.tokenBucketRateLimit(key, rateLimit.capacity(), rateLimit.refillRate());
            case FIXED_WINDOW:
                return rateLimitManager.fixedWindowRateLimit(key, rateLimit.window(), rateLimit.limit());
            default:
                return rateLimitManager.slidingWindowRateLimit(key, rateLimit.window(), rateLimit.limit());
        }
    }
    
    /**
     * 获取用户ID。基于 Sa-Token 的登录状态判断：
     * - 已登录：返回 StpUtil 的 loginId
     * - 未登录：返回 null（USER 维度会回退为 anonymous）
     */
    private String getUserId(HttpServletRequest request) {
        try {
            if (!StpUtil.isLogin()) {
                return null;
            }
            Object loginId = StpUtil.getLoginId();
            return loginId == null ? null : loginId.toString();
        } catch (Exception e) {
            // 未登录或 token 无效时静默回退
            return null;
        }
    }
}
