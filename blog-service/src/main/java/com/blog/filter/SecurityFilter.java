package com.blog.filter;

import com.blog.security.SqlInjectionProtector;
import com.blog.util.IpUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * 安全过滤器
 * 用于检测和防护各种安全攻击
 */
@Component
public class SecurityFilter implements Filter {
    
    private static final Logger logger = LoggerFactory.getLogger(SecurityFilter.class);
    
    @Autowired
    private SqlInjectionProtector sqlInjectionProtector;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // 需要跳过安全检查的路径
    private static final String[] SKIP_PATHS = {
        "/actuator/", "/swagger-", "/v3/api-docs", "/favicon.ico"
    };
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String requestUri = httpRequest.getRequestURI();
        String clientIp = IpUtil.getClientIp(httpRequest);
        
        // 跳过特定路径
        if (shouldSkipSecurity(requestUri)) {
            chain.doFilter(request, response);
            return;
        }
        
        try {
            // 1. 检查请求头安全性
            if (!validateHeaders(httpRequest)) {
                sendSecurityError(httpResponse, "请求头包含恶意内容");
                return;
            }
            
            // 2. 检查请求参数安全性
            if (!validateParameters(httpRequest)) {
                sendSecurityError(httpResponse, "请求参数包含恶意内容");
                return;
            }
            
            // 3. 检查User-Agent
            if (!validateUserAgent(httpRequest)) {
                sendSecurityError(httpResponse, "非法的User-Agent");
                return;
            }
            
            // 4. 检查Referer（防止CSRF）
            if (!validateReferer(httpRequest)) {
                sendSecurityError(httpResponse, "非法的Referer");
                return;
            }
            
            // 5. 添加安全响应头
            addSecurityHeaders(httpResponse);
            
            // 继续处理请求
            chain.doFilter(request, response);
            
        } catch (Exception e) {
            logger.error("安全过滤器处理异常, IP: {}, URI: {}", clientIp, requestUri, e);
            sendSecurityError(httpResponse, "请求处理异常");
        }
    }
    
    /**
     * 检查是否需要跳过安全检查
     */
    private boolean shouldSkipSecurity(String requestUri) {
        for (String skipPath : SKIP_PATHS) {
            if (requestUri.contains(skipPath)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 验证请求头安全性
     */
    private boolean validateHeaders(HttpServletRequest request) {
        Enumeration<String> headerNames = request.getHeaderNames();
        
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            
            if (StringUtils.hasText(headerValue)) {
                // 检查SQL注入
                if (sqlInjectionProtector.containsSqlInjection(headerValue)) {
                    logger.warn("检测到请求头SQL注入攻击, Header: {}, Value: {}, IP: {}", 
                        headerName, headerValue, IpUtil.getClientIp(request));
                    return false;
                }
                
                // 检查XSS
                if (sqlInjectionProtector.containsXss(headerValue)) {
                    logger.warn("检测到请求头XSS攻击, Header: {}, Value: {}, IP: {}", 
                        headerName, headerValue, IpUtil.getClientIp(request));
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * 验证请求参数安全性
     */
    private boolean validateParameters(HttpServletRequest request) {
        // 检查URL参数
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String[] paramValues = request.getParameterValues(paramName);
            
            if (paramValues != null) {
                for (String paramValue : paramValues) {
                    SqlInjectionProtector.ValidationResult result = 
                        sqlInjectionProtector.validateParameter(paramName, paramValue);
                    
                    if (!result.isValid()) {
                        logger.warn("检测到参数安全攻击, Param: {}, Value: {}, IP: {}, Message: {}", 
                            paramName, paramValue, IpUtil.getClientIp(request), result.getMessage());
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * 验证User-Agent
     */
    private boolean validateUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        
        if (!StringUtils.hasText(userAgent)) {
            // 允许空User-Agent，但记录日志
            logger.info("检测到空User-Agent, IP: {}", IpUtil.getClientIp(request));
            return true;
        }
        
        // 检查是否为已知的恶意User-Agent
        String[] maliciousUserAgents = {
            "sqlmap", "nmap", "nikto", "w3af", "acunetix", "netsparker", 
            "burpsuite", "owasp", "grabber", "wpscan"
        };
        
        String lowerUserAgent = userAgent.toLowerCase();
        for (String malicious : maliciousUserAgents) {
            if (lowerUserAgent.contains(malicious)) {
                logger.warn("检测到恶意User-Agent: {}, IP: {}", userAgent, IpUtil.getClientIp(request));
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 验证Referer（简单的CSRF防护）
     */
    private boolean validateReferer(HttpServletRequest request) {
        String method = request.getMethod();
        
        // 只对POST、PUT、DELETE请求检查Referer
        if (!"POST".equals(method) && !"PUT".equals(method) && !"DELETE".equals(method)) {
            return true;
        }
        
        String referer = request.getHeader("Referer");
        String host = request.getHeader("Host");
        
        // 如果没有Referer，允许通过（可能是API调用）
        if (!StringUtils.hasText(referer)) {
            return true;
        }
        
        // 检查Referer是否来自同一域名
        if (StringUtils.hasText(host) && !referer.contains(host)) {
            logger.warn("检测到可能的CSRF攻击, Referer: {}, Host: {}, IP: {}", 
                referer, host, IpUtil.getClientIp(request));
            // 这里可以根据需要决定是否阻止请求
            // return false;
        }
        
        return true;
    }
    
    /**
     * 添加安全响应头
     */
    private void addSecurityHeaders(HttpServletResponse response) {
        // 防止XSS攻击
        response.setHeader("X-XSS-Protection", "1; mode=block");
        
        // 防止MIME类型嗅探
        response.setHeader("X-Content-Type-Options", "nosniff");
        
        // 防止点击劫持
        response.setHeader("X-Frame-Options", "DENY");
        
        // 强制HTTPS（如果是HTTPS环境）
        // response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        
        // 内容安全策略（根据需要调整）
        response.setHeader("Content-Security-Policy", 
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
        
        // 引用策略
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // 权限策略
        response.setHeader("Permissions-Policy", 
            "geolocation=(), microphone=(), camera=()");
    }
    
    /**
     * 发送安全错误响应
     */
    private void sendSecurityError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json;charset=UTF-8");
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", 400);
        errorResponse.put("message", "请求被安全策略拒绝");
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}