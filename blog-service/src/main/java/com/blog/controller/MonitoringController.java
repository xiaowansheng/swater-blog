package com.blog.controller;

import com.blog.annotation.ApiOperation;
import com.blog.common.Result;
import com.blog.metrics.BlogMetrics;
import com.blog.model.enums.ApiOperationType;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Metrics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 监控测试控制器
 * 用于测试监控指标收集
 */
@RestController
@RequestMapping("/api/monitoring")
@ApiOperation(value = "monitoring", name = "监控模块", description = "监控测试接口", open = false)
public class MonitoringController {

    @Autowired
    private BlogMetrics blogMetrics;

    @Autowired
    private MeterRegistry meterRegistry;

    /**
     * 测试文章创建指标
     */
    @PostMapping("/test/article-created")
    @ApiOperation(value = "testArticleCreated", name = "测试文章创建指标", type = ApiOperationType.OTHER, description = "测试文章创建指标")
    public Result<String> testArticleCreated(@RequestParam(defaultValue = "tech") String category,
                                           @RequestParam(defaultValue = "original") String type) {
        blogMetrics.incrementArticleCreated(category, type);
        return Result.success("文章创建指标已记录");
    }

    /**
     * 测试文章浏览指标
     */
    @PostMapping("/test/article-view")
    @ApiOperation(value = "testArticleView", name = "测试文章浏览指标", type = ApiOperationType.OTHER, description = "测试文章浏览指标")
    public Result<String> testArticleView(@RequestParam(defaultValue = "tech") String category,
                                        @RequestParam(defaultValue = "1") Long articleId) {
        blogMetrics.incrementArticleView(category, articleId);
        return Result.success("文章浏览指标已记录");
    }

    /**
     * 测试用户登录指标
     */
    @PostMapping("/test/user-login")
    @ApiOperation(value = "testUserLogin", name = "测试用户登录指标", type = ApiOperationType.OTHER, description = "测试用户登录指标")
    public Result<String> testUserLogin(@RequestParam(defaultValue = "password") String loginType,
                                      @RequestParam(defaultValue = "true") boolean success) {
        blogMetrics.incrementUserLogin(loginType, success);
        return Result.success("用户登录指标已记录");
    }

    /**
     * 获取当前监控指标概览
     */
    @GetMapping("/metrics/overview")
    @ApiOperation(value = "metricsOverview", name = "获取监控指标概览", type = ApiOperationType.QUERY, description = "获取当前监控指标概览")
    public Result<Map<String, Object>> getMetricsOverview() {
        Map<String, Object> metrics = new HashMap<>();

        // 获取一些关键指标
        try {
            metrics.put("article_created_total",
                meterRegistry.get("blog.article.created").counter().count());
        } catch (Exception e) {
            metrics.put("article_created_total", 0);
        }

        try {
            metrics.put("article_views_total",
                meterRegistry.get("blog.article.views").counter().count());
        } catch (Exception e) {
            metrics.put("article_views_total", 0);
        }

        try {
            metrics.put("user_login_total",
                meterRegistry.get("blog.user.login").counter().count());
        } catch (Exception e) {
            metrics.put("user_login_total", 0);
        }

        try {
            metrics.put("active_users",
                meterRegistry.get("blog.users.active").gauge().value());
        } catch (Exception e) {
            metrics.put("active_users", 0);
        }

        try {
            metrics.put("total_articles",
                meterRegistry.get("blog.articles.total").gauge().value());
        } catch (Exception e) {
            metrics.put("total_articles", 0);
        }

        return Result.success(metrics);
    }

    /**
     * 模拟慢查询测试
     */
    @GetMapping("/test/slow-query")
    @ApiOperation(value = "testSlowQuery", name = "测试慢查询", type = ApiOperationType.OTHER, description = "模拟慢查询测试")
    public Result<String> testSlowQuery(@RequestParam(defaultValue = "1000") int delayMs) {
        try {
            Thread.sleep(delayMs);
            return Result.success("慢查询测试完成，延迟: " + delayMs + "ms");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Result.error("测试被中断");
        }
    }
}
