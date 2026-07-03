package com.blog.infrastructure.filter;



import com.blog.infrastructure.security.SqlInjectionProtector;
import com.blog.shared.util.IpUtil;
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
import java.util.Set;
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

    /**
     * CSRF（Referer/Origin 同源校验）开关。
     * 默认关闭以保证本地开发与无头 API 调用开箱可用；
     * 生产环境应在 application-docker.yml / application-prod.yml 中设为 true。
     */
    @org.springframework.beans.factory.annotation.Value("${security.csrf.enabled:false}")
    private boolean csrfEnabled;

    // 需要跳过安全检查的路径（基础路径，不包含context-path）
    private static final String[] SKIP_PATHS_BASE = {
        "/actuator/", "/swagger-", "/v3/api-docs", "/favicon.ico", "/uploads/"
    };
    
    // 标准HTTP请求头（这些请求头通常包含安全的值）
    private static final String[] STANDARD_HTTP_HEADERS = {
        "accept", "accept-encoding", "accept-language", "authorization", 
        "cache-control", "connection", "content-type", "content-length",
        "host", "origin", "referer", "user-agent", "x-requested-with",
        "x-forwarded-for", "x-real-ip", "pragma", "upgrade-insecure-requests",
        // 浏览器 Client Hints 标准请求头
        "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform", "sec-ch-ua-arch",
        "sec-ch-ua-bitness", "sec-ch-ua-full-version", "sec-ch-ua-full-version-list",
        "sec-ch-ua-model", "sec-ch-ua-platform-version", "sec-ch-ua-wow64",
        "sec-fetch-dest", "sec-fetch-mode", "sec-fetch-site", "sec-fetch-user"
    };
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String requestUri = httpRequest.getRequestURI();
        String clientIp = IpUtil.getClientIp(httpRequest);
        
        // 0. 放行 OPTIONS 请求 (CORS 预检)
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }
        
        // 跳过特定路径
        if (shouldSkipSecurity(requestUri, httpRequest.getContextPath())) {
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
            addSecurityHeaders(httpRequest, httpResponse);
            
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
    private boolean shouldSkipSecurity(String requestUri, String requestContextPath) {
        for (String skipPath : SKIP_PATHS_BASE) {
            // 检查是否匹配基础路径（如 /uploads/）
            if (requestUri.contains(skipPath)) {
                return true;
            }
            // 检查是否匹配完整路径（如 /uploads/）
            if (requestContextPath != null && !requestContextPath.isEmpty()) {
                String fullPath = requestContextPath + skipPath;
                if (requestUri.contains(fullPath)) {
                    return true;
                }
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
                // 对于标准HTTP请求头，使用更宽松的检查
                if (isStandardHttpHeader(headerName)) {
                    // 只检查明显的恶意内容，跳过常见的HTTP值
                    if (containsObviousMaliciousContent(headerValue)) {
                        logger.warn("检测到请求头恶意内容, Header: {}, Value: {}, IP: {}", 
                            headerName, headerValue, IpUtil.getClientIp(request));
                        return false;
                    }
                } else {
                    // 对于自定义请求头，进行完整的安全检查
                    if (sqlInjectionProtector.containsSqlInjection(headerValue)) {
                        logger.warn("检测到请求头SQL注入攻击, Header: {}, Value: {}, IP: {}", 
                            headerName, headerValue, IpUtil.getClientIp(request));
                        return false;
                    }
                    
                    if (sqlInjectionProtector.containsXss(headerValue)) {
                        logger.warn("检测到请求头XSS攻击, Header: {}, Value: {}, IP: {}", 
                            headerName, headerValue, IpUtil.getClientIp(request));
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * 检查是否为标准HTTP请求头
     */
    private boolean isStandardHttpHeader(String headerName) {
        if (!StringUtils.hasText(headerName)) {
            return false;
        }
        
        String lowerHeaderName = headerName.toLowerCase();
        for (String standardHeader : STANDARD_HTTP_HEADERS) {
            if (lowerHeaderName.equals(standardHeader)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 检查是否包含明显的恶意内容（用于标准HTTP请求头的宽松检查）
     */
    private boolean containsObviousMaliciousContent(String value) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        
        String lowerValue = value.toLowerCase();
        
        // 检查明显的SQL注入关键词
        String[] obviousSqlKeywords = {
            "union select", "drop table", "delete from", "insert into",
            "update set", "exec(", "execute(", "sp_", "xp_"
        };
        
        for (String keyword : obviousSqlKeywords) {
            if (lowerValue.contains(keyword)) {
                return true;
            }
        }
        
        // 检查明显的XSS攻击
        String[] obviousXssPatterns = {
            "<script", "javascript:", "vbscript:", "onload=", "onerror=",
            "eval(", "alert(", "document.cookie"
        };
        
        for (String pattern : obviousXssPatterns) {
            if (lowerValue.contains(pattern)) {
                return true;
            }
        }
        
        return false;
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
                    // 对于搜索关键字，放宽 SQL 注入的纯单词过滤，防止误杀 legimate 技术名词
                    if ("keyword".equals(paramName)) {
                        // 仅检查 XSS 和明显的危险 SQL Payload（如 union select 等），跳过普通单字匹配
                        if (sqlInjectionProtector.containsXss(paramValue) || containsObviousMaliciousContent(paramValue)) {
                            logger.warn("检测到搜索参数安全攻击, Param: {}, Value: {}, IP: {}", 
                                paramName, paramValue, IpUtil.getClientIp(request));
                            return false;
                        }
                        continue;
                    }

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
     * 验证 Referer / Origin（CSRF 防护）。
     *
     * 校验规则（security.csrf.enabled=true 时生效）：
     * 1. 仅对写请求（POST/PUT/DELETE/PATCH）校验；
     * 2. 开发环境域名组合（见 isDevEnvironment）直接放行；
     * 3. 已认证的写请求（携带 Authorization 或 JSON 请求体）必须携带同源 Referer/Origin，
     *    否则视为 CSRF 拒绝——修复了历史上「无 Referer 一律放行」的绕过缺陷；
     * 4. 未携带认证头的公开写请求（如公开评论表单）在无 Referer 时仍放行，避免误伤。
     */
    private boolean validateReferer(HttpServletRequest request) {
        // 开关关闭时不做任何 CSRF 校验（本地开发/无头 API 默认）
        if (!csrfEnabled) {
            return true;
        }

        String method = request.getMethod();

        // 只对写请求校验
        if (!"POST".equals(method) && !"PUT".equals(method) && !"DELETE".equals(method) && !"PATCH".equals(method)) {
            return true;
        }

        String referer = request.getHeader("Referer");
        String origin = request.getHeader("Origin");
        String host = request.getHeader("Host");
        boolean hasRefererOrOrigin = StringUtils.hasText(referer) || StringUtils.hasText(origin);

        // 开发环境域名组合放行（仅当确实携带了 Referer/Origin 时才需要匹配）
        if (hasRefererOrOrigin && isDevEnvironment(referer != null ? referer : origin, host)) {
            return true;
        }

        // 已认证写请求（带 Authorization 或 JSON 请求体）必须有同源 Referer/Origin，
        // 否则拒绝——这是 CSRF 防护的关键：浏览器发起的合法请求总会带上这两个头之一
        if (isAuthenticatedWriteRequest(request) && !hasRefererOrOrigin) {
            logger.warn("已认证写请求缺少 Referer/Origin，疑似 CSRF, Method: {}, URI: {}, Host: {}, IP: {}",
                    method, request.getRequestURI(), host, IpUtil.getClientIp(request));
            return false;
        }

        // 携带了 Referer/Origin 则必须同源
        if (hasRefererOrOrigin && StringUtils.hasText(host)) {
            String source = StringUtils.hasText(origin) ? origin : referer;
            if (!isSameOrigin(source, host)) {
                logger.warn("检测到跨站请求，疑似 CSRF, Source: {}, Host: {}, IP: {}",
                        source, host, IpUtil.getClientIp(request));
                return false;
            }
        }

        return true;
    }

    /**
     * 判断是否为已认证的写请求（携带 Authorization 头，或 Content-Type 为 JSON）。
     */
    private boolean isAuthenticatedWriteRequest(HttpServletRequest request) {
        if (StringUtils.hasText(request.getHeader("Authorization"))) {
            return true;
        }
        String contentType = request.getContentType();
        return contentType != null && contentType.toLowerCase().contains("application/json");
    }

    /**
     * 判断 Referer/Origin 与目标 Host 是否同源。
     * Origin/Referer 形如 "https://admin.example.com:443/path"，Host 形如 "admin.example.com" 或 "admin.example.com:443"。
     */
    private boolean isSameOrigin(String source, String host) {
        // 提取 source 中的 host[:port] 部分
        String sourceHost = source;
        int schemeIdx = source.indexOf("://");
        if (schemeIdx >= 0) {
            sourceHost = source.substring(schemeIdx + 3);
        }
        int pathIdx = sourceHost.indexOf('/');
        if (pathIdx >= 0) {
            sourceHost = sourceHost.substring(0, pathIdx);
        }
        // 标准化默认端口：Host 可能不带端口，source 可能带默认端口（如 https + :443）
        return host.equals(stripDefaultPort(sourceHost))
                || sourceHost.equals(stripDefaultPort(host))
                || host.equals(sourceHost);
    }

    /**
     * 去掉默认端口（http→80，https→443）。
     */
    private String stripDefaultPort(String hostPort) {
        if (hostPort == null) {
            return hostPort;
        }
        if (hostPort.endsWith(":80") || hostPort.endsWith(":443")) {
            int idx = hostPort.lastIndexOf(':');
            return hostPort.substring(0, idx);
        }
        return hostPort;
    }
    
    /**
     * 检查是否为开发环境的合法请求。
     * 精确比对 Referer/Origin 的 host[:port] 与目标 Host，避免 `contains` 被构造
     * （如 `evil.com?localhost:3000`）绕过。仅匹配本地开发端口组合。
     */
    private boolean isDevEnvironment(String referer, String host) {
        if (!StringUtils.hasText(referer) || !StringUtils.hasText(host)) {
            return false;
        }

        // 提取 Referer/Origin 的 host[:port]，复用 isSameOrigin 的解析逻辑
        String sourceHost = referer;
        int schemeIdx = sourceHost.indexOf("://");
        if (schemeIdx >= 0) {
            sourceHost = sourceHost.substring(schemeIdx + 3);
        }
        int pathIdx = sourceHost.indexOf('/');
        if (pathIdx >= 0) {
            sourceHost = sourceHost.substring(0, pathIdx);
        }
        // 标准化默认端口后比对（localhost 与 127.0.0.1 视作等价）
        String normalizedSource = normalizeDevHost(stripDefaultPort(sourceHost));
        String normalizedTarget = normalizeDevHost(stripDefaultPort(host));
        if (normalizedSource == null || normalizedTarget == null) {
            return false;
        }

        // 允许的开发环境 host（去端口后）：前端 3000/3001/3002 -> 后端 8888
        Set<String> allowedFront = Set.of("localhost:3000", "127.0.0.1:3000",
                "localhost:3001", "127.0.0.1:3001",
                "localhost:3002", "127.0.0.1:3002");
        Set<String> allowedBack = Set.of("localhost:8888", "127.0.0.1:8888");

        return allowedFront.contains(normalizedSource) && allowedBack.contains(normalizedTarget);
    }

    /**
     * 开发环境 host 归一化：localhost ↔ 127.0.0.1 视作同一主机。
     * 仅对本地地址生效，非本地地址原样返回。
     */
    private String normalizeDevHost(String hostPort) {
        if (hostPort == null) {
            return null;
        }
        if (hostPort.startsWith("localhost:")) {
            return "127.0.0.1:" + hostPort.substring("localhost:".length());
        }
        return hostPort;
    }
    
    /**
     * 添加安全响应头
     */
    private void addSecurityHeaders(HttpServletRequest request, HttpServletResponse response) {
        // 防止MIME类型嗅探
        response.setHeader("X-Content-Type-Options", "nosniff");

        // 防止点击劫持
        response.setHeader("X-Frame-Options", "DENY");

        // 强制HTTPS（HSTS）：仅在 HTTPS 请求时下发，避免把 HTTP 流量重定向到 HTTPS 导致中间人风险
        if (request.isSecure()) {
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        // 内容安全策略
        // script-src 不再允许 'unsafe-inline'，避免存储型 XSS 执行内联脚本；
        // 若后续确需内联脚本，请改为 nonce 或 hash 机制。
        response.setHeader("Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");

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