package com.blog.core.filter;



import com.blog.core.context.UserContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
/**
 * 请求清理过滤器
 * <p>
 * 在每个请求结束时清理 ThreadLocal，防止内存泄漏
 * </p>
 *
 * @author Claude
 * @since 2025-12-30
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE) // 优先级最低，确保在其他过滤器之后执行
public class RequestCleanupFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestCleanupFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // 继续处理请求
            filterChain.doFilter(request, response);
        } finally {
            // 请求结束，清理 ThreadLocal（无论请求成功还是失败）
            try {
                UserContext.clear();
            } catch (Exception e) {
                // 清理失败不应该影响请求处理，只记录日志
                log.warn("清理用户上下文失败: {}", e.getMessage());
            }
        }
    }
}
