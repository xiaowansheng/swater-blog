package com.blog.infrastructure.filter;


import com.blog.infrastructure.security.RateLimitManager;
import com.blog.shared.Result;
import com.blog.shared.util.IpUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.extern.slf4j.Slf4j;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class GlobalRateLimitFilter extends OncePerRequestFilter {

    private final PathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    private RateLimitManager rateLimitManager;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Environment environment;

    @Value("${security.rate-limit.enabled:false}")
    private boolean enabled;

    @Value("${security.rate-limit.ip-per-second:10}")
    private int ipPerSecond;

    @Value("${security.rate-limit.ip-per-minute:500}")
    private int ipPerMinute;

    @Value("${security.rate-limit.message:Too many requests}")
    private String message;

    private List<String> whitelist = Collections.emptyList();

    @PostConstruct
    public void initWhitelist() {
        whitelist = Binder.get(environment)
            .bind("security.rate-limit.whitelist", Bindable.listOf(String.class))
            .orElseGet(Collections::emptyList);
        log.info("GlobalRateLimitFilter initialized - enabled: {}, ipPerSecond: {}, ipPerMinute: {}, whitelist: {}", 
                 enabled, ipPerSecond, ipPerMinute, whitelist);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        if (isWhitelisted(request)) {
            log.debug("Request whitelisted: {} {}", request.getMethod(), request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        if (isPreflight(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = IpUtil.getClientIp(request);
        log.debug("Rate limit check for IP: {} - {} {}", ip, request.getMethod(), request.getRequestURI());

        RateLimitManager.RateLimitResult secondResult = null;
        RateLimitManager.RateLimitResult minuteResult = null;

        if (ipPerSecond > 0) {
            String secondKey = "rate_limit:ip:sec:" + ip;
            secondResult = rateLimitManager.slidingWindowRateLimit(secondKey, 1, ipPerSecond);
            applySecondHeaders(response, secondResult);
            if (!secondResult.isAllowed()) {
                log.warn("Rate limit exceeded (per second) - IP: {}, URI: {}, Limit: {}, Current: {}", 
                         ip, request.getRequestURI(), ipPerSecond, secondResult.getCurrentCount());
                applyStandardHeaders(response, secondResult, ipPerSecond);
                writeRateLimitResponse(response);
                return;
            }
        }

        if (ipPerMinute > 0) {
            String minuteKey = "rate_limit:ip:min:" + ip;
            minuteResult = rateLimitManager.slidingWindowRateLimit(minuteKey, 60, ipPerMinute);
            applyMinuteHeaders(response, minuteResult);
            if (!minuteResult.isAllowed()) {
                log.warn("Rate limit exceeded (per minute) - IP: {}, URI: {}, Limit: {}, Current: {}", 
                         ip, request.getRequestURI(), ipPerMinute, minuteResult.getCurrentCount());
                applyStandardHeaders(response, minuteResult, ipPerMinute);
                writeRateLimitResponse(response);
                return;
            }
        }

        if (minuteResult != null) {
            applyStandardHeaders(response, minuteResult, ipPerMinute);
        } else if (secondResult != null) {
            applyStandardHeaders(response, secondResult, ipPerSecond);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPreflight(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    private boolean isWhitelisted(HttpServletRequest request) {
        if (whitelist.isEmpty()) {
            return false;
        }

        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String normalizedUri = requestUri;

        if (contextPath != null && !contextPath.isEmpty() && requestUri.startsWith(contextPath)) {
            normalizedUri = requestUri.substring(contextPath.length());
        }

        for (String pattern : whitelist) {
            if (pathMatcher.match(pattern, requestUri) || pathMatcher.match(pattern, normalizedUri)) {
                log.debug("URI matched whitelist pattern: {} -> {}", requestUri, pattern);
                return true;
            }
        }

        return false;
    }

    private void applySecondHeaders(HttpServletResponse response, RateLimitManager.RateLimitResult result) {
        response.setHeader("X-RateLimit-Limit-Second", String.valueOf(ipPerSecond));
        response.setHeader("X-RateLimit-Remaining-Second", String.valueOf(result.getRemaining()));
        response.setHeader("X-RateLimit-Reset-Second", String.valueOf(result.getResetTime()));
    }

    private void applyMinuteHeaders(HttpServletResponse response, RateLimitManager.RateLimitResult result) {
        response.setHeader("X-RateLimit-Limit-Minute", String.valueOf(ipPerMinute));
        response.setHeader("X-RateLimit-Remaining-Minute", String.valueOf(result.getRemaining()));
        response.setHeader("X-RateLimit-Reset-Minute", String.valueOf(result.getResetTime()));
    }

    private void applyStandardHeaders(HttpServletResponse response,
                                      RateLimitManager.RateLimitResult result,
                                      int limit) {
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemaining()));
        response.setHeader("X-RateLimit-Reset", String.valueOf(result.getResetTime()));
    }

    private void writeRateLimitResponse(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");
        Result<?> error = Result.error(429, message);
        response.getWriter().write(objectMapper.writeValueAsString(error));
    }
}
