package com.blog.metrics;

import io.micrometer.core.instrument.*;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Blog业务指标收集器
 */
@Component
public class BlogMetrics {
    
    private final Counter articleCreatedCounter;
    private final Counter articleViewCounter;
    private final Counter commentCreatedCounter;
    private final Counter userLoginCounter;
    private final Timer articleQueryTimer;
    private final Timer databaseQueryTimer;
    private final Gauge activeUsersGauge;
    private final Gauge articleTotalGauge;
    
    // 用于Gauge指标的原子计数器
    private final AtomicLong activeUsers = new AtomicLong(0);
    private final AtomicLong totalArticles = new AtomicLong(0);
    
    public BlogMetrics(MeterRegistry meterRegistry) {
        // 文章创建计数器
        this.articleCreatedCounter = Counter.builder("blog.article.created")
            .description("文章创建总数")
            .register(meterRegistry);
            
        // 文章浏览计数器
        this.articleViewCounter = Counter.builder("blog.article.views")
            .description("文章浏览总数")
            .register(meterRegistry);
            
        // 评论创建计数器
        this.commentCreatedCounter = Counter.builder("blog.comment.created")
            .description("评论创建总数")
            .register(meterRegistry);
            
        // 用户登录计数器
        this.userLoginCounter = Counter.builder("blog.user.login")
            .description("用户登录总数")
            .register(meterRegistry);
            
        // 文章查询耗时
        this.articleQueryTimer = Timer.builder("blog.article.query")
            .description("文章查询耗时")
            .register(meterRegistry);
            
        // 数据库查询耗时
        this.databaseQueryTimer = Timer.builder("blog.database.query")
            .description("数据库查询耗时")
            .register(meterRegistry);
            
        // 活跃用户数量
        this.activeUsersGauge = Gauge.builder("blog.users.active")
            .description("当前活跃用户数")
            .register(meterRegistry, activeUsers, AtomicLong::get);
            
        // 文章总数
        this.articleTotalGauge = Gauge.builder("blog.articles.total")
            .description("文章总数")
            .register(meterRegistry, totalArticles, AtomicLong::get);
    }
    
    /**
     * 记录文章创建
     */
    public void incrementArticleCreated(String category, String type) {
        articleCreatedCounter.increment(
            Tags.of(
                "category", category != null ? category : "unknown",
                "type", type != null ? type : "original"
            )
        );
    }
    
    /**
     * 记录文章浏览
     */
    public void incrementArticleView(String category, Long articleId) {
        articleViewCounter.increment(
            Tags.of(
                "category", category != null ? category : "unknown",
                "article_id", String.valueOf(articleId)
            )
        );
    }
    
    /**
     * 记录评论创建
     */
    public void incrementCommentCreated(String type, String status) {
        commentCreatedCounter.increment(
            Tags.of(
                "type", type != null ? type : "article",
                "status", status != null ? status : "pending"
            )
        );
    }
    
    /**
     * 记录用户登录
     */
    public void incrementUserLogin(String loginType, boolean success) {
        userLoginCounter.increment(
            Tags.of(
                "type", loginType != null ? loginType : "password",
                "success", String.valueOf(success)
            )
        );
    }
    
    /**
     * 记录文章查询耗时
     */
    public void recordArticleQuery(Duration duration, String queryType) {
        articleQueryTimer.record(duration, 
            Tags.of("type", queryType != null ? queryType : "list")
        );
    }
    
    /**
     * 记录数据库查询耗时
     */
    public void recordDatabaseQuery(Duration duration, String operation, String table) {
        databaseQueryTimer.record(duration,
            Tags.of(
                "operation", operation != null ? operation : "select",
                "table", table != null ? table : "unknown"
            )
        );
    }
    
    /**
     * 更新活跃用户数
     */
    public void updateActiveUsers(long count) {
        activeUsers.set(count);
    }
    
    /**
     * 更新文章总数
     */
    public void updateTotalArticles(long count) {
        totalArticles.set(count);
    }
    
    /**
     * 创建定时器样本
     */
    public Timer.Sample startTimer() {
        return Timer.start();
    }
    
    /**
     * 停止定时器并记录到指定指标
     */
    public void stopTimer(Timer.Sample sample, String metricName, Tags tags) {
        sample.stop(Timer.builder(metricName)
            .tags(tags)
            .register(Metrics.globalRegistry));
    }
}