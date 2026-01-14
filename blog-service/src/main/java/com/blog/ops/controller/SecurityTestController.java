package com.blog.ops.controller;



import com.blog.shared.annotation.RateLimit;
import com.blog.shared.Result;
import com.blog.infrastructure.security.DataMaskingService;
import com.blog.infrastructure.security.RateLimitManager;
import com.blog.infrastructure.security.SqlInjectionProtector;
import com.blog.shared.util.IpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
/**
 * 安全功能测试控制器
 * 用于测试各种安全功能
 */
@RestController
@RequestMapping("/api/security-test")
public class SecurityTestController {

    @Value("${spring.mvc.servlet.path:}")
    private String contextPath;

    @Autowired
    private RateLimitManager rateLimitManager;
    
    @Autowired
    private DataMaskingService dataMaskingService;
    
    @Autowired
    private SqlInjectionProtector sqlInjectionProtector;
    
    /**
     * 测试IP限流
     */
    @GetMapping("/rate-limit/ip")
    @RateLimit(
        type = RateLimit.Type.SLIDING_WINDOW,
        dimension = RateLimit.Dimension.IP,
        window = 60,
        limit = 5,
        message = "IP访问过于频繁"
    )
    public Result<String> testIpRateLimit(HttpServletRequest request) {
        String ip = IpUtil.getClientIp(request);
        return Result.success("IP限流测试成功，您的IP: " + ip);
    }
    
    /**
     * 测试令牌桶限流
     */
    @GetMapping("/rate-limit/token-bucket")
    @RateLimit(
        type = RateLimit.Type.TOKEN_BUCKET,
        capacity = 10,
        refillRate = 2.0,
        message = "令牌桶限流触发"
    )
    public Result<String> testTokenBucketRateLimit() {
        return Result.success("令牌桶限流测试成功");
    }
    
    /**
     * 测试数据脱敏
     */
    @PostMapping("/data-masking")
    public Result<Map<String, String>> testDataMasking(@RequestBody Map<String, String> data) {
        Map<String, String> maskedData = new HashMap<>();
        
        data.forEach((key, value) -> {
            String maskedValue = switch (key.toLowerCase()) {
                case "email" -> dataMaskingService.maskEmail(value);
                case "phone" -> dataMaskingService.maskPhone(value);
                case "idcard" -> dataMaskingService.maskIdCard(value);
                case "name" -> dataMaskingService.maskName(value);
                case "bankcard" -> dataMaskingService.maskBankCard(value);
                case "address" -> dataMaskingService.maskAddress(value);
                case "ip" -> dataMaskingService.maskIp(value);
                case "qq" -> dataMaskingService.maskQQ(value);
                case "password" -> dataMaskingService.maskPassword(value);
                default -> dataMaskingService.autoMaskSensitiveInfo(value);
            };
            maskedData.put(key, maskedValue);
        });
        
        return Result.success(maskedData);
    }
    
    /**
     * 测试SQL注入检测
     */
    @PostMapping("/sql-injection-check")
    public Result<Map<String, Object>> testSqlInjectionCheck(@RequestParam String input) {
        Map<String, Object> result = new HashMap<>();
        
        boolean containsSqlInjection = sqlInjectionProtector.containsSqlInjection(input);
        boolean containsXss = sqlInjectionProtector.containsXss(input);
        String sanitizedInput = sqlInjectionProtector.sanitizeInput(input);
        
        result.put("original", input);
        result.put("containsSqlInjection", containsSqlInjection);
        result.put("containsXss", containsXss);
        result.put("sanitized", sanitizedInput);
        result.put("safe", !containsSqlInjection && !containsXss);
        
        return Result.success(result);
    }
    
    /**
     * 测试文件名安全检查
     */
    @PostMapping("/filename-check")
    public Result<Map<String, Object>> testFilenameCheck(@RequestParam String filename) {
        Map<String, Object> result = new HashMap<>();
        
        boolean isValid = sqlInjectionProtector.isValidFileName(filename);
        
        result.put("filename", filename);
        result.put("isValid", isValid);
        result.put("message", isValid ? "文件名安全" : "文件名包含危险字符或扩展名");
        
        return Result.success(result);
    }
    
    /**
     * 测试限流状态查询
     */
    @GetMapping("/rate-limit/status")
    public Result<Map<String, Object>> getRateLimitStatus(HttpServletRequest request) {
        String ip = IpUtil.getClientIp(request);
        
        // 测试不同类型的限流状态
        RateLimitManager.RateLimitResult ipResult = 
            rateLimitManager.ipRateLimit(ip, 60, 100);
        
        RateLimitManager.RateLimitResult apiResult =
            rateLimitManager.apiRateLimit(contextPath + "/security-test/rate-limit/status", 60, 50);
        
        Map<String, Object> status = new HashMap<>();
        status.put("ip", ip);
        status.put("ipRateLimit", Map.of(
            "allowed", ipResult.isAllowed(),
            "remaining", ipResult.getRemaining(),
            "resetTime", ipResult.getResetTime()
        ));
        status.put("apiRateLimit", Map.of(
            "allowed", apiResult.isAllowed(),
            "remaining", apiResult.getRemaining(),
            "resetTime", apiResult.getResetTime()
        ));
        
        return Result.success(status);
    }
    
    /**
     * 测试敏感信息检测
     */
    @PostMapping("/sensitive-info-check")
    public Result<Map<String, Object>> testSensitiveInfoCheck(@RequestParam String text) {
        Map<String, Object> result = new HashMap<>();
        
        boolean containsSensitive = dataMaskingService.containsSensitiveInfo(text);
        String autoMasked = dataMaskingService.autoMaskSensitiveInfo(text);
        
        result.put("original", text);
        result.put("containsSensitiveInfo", containsSensitive);
        result.put("autoMasked", autoMasked);
        
        return Result.success(result);
    }
}