package com.blog.infrastructure.metrics;



import io.micrometer.core.instrument.*;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;
/**
 * Blog业务指标收集器
 */
@Component
public class BlogMetrics {

    private final MeterRegistry meterRegistry;

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
        this.meterRegistry = meterRegistry;

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
        this.activeUsersGauge = Gauge.builder("blog.users.active", activeUsers, AtomicLong::doubleValue)
            .description("当前活跃用户数")
            .register(meterRegistry);

        // 文章总数
        this.articleTotalGauge = Gauge.builder("blog.articles.total", totalArticles, AtomicLong::doubleValue)
            .description("文章总数")
            .register(meterRegistry);
    }

    /**
     * 记录文章创建
     */
    public void incrementArticleCreated(String category, String type) {
        Counter.builder("blog.article.created")
            .description("文章创建总数")
            .tag("category", category != null ? category : "unknown")
            .tag("type", type != null ? type : "original")
            .register(meterRegistry)
            .increment();
    }

    /**
     * 记录文章浏览
     */
    public void incrementArticleView(String category, Long articleId) {
        Counter.builder("blog.article.views")
            .description("文章浏览总数")
            .tag("category", category != null ? category : "unknown")
            .tag("article_id", String.valueOf(articleId))
            .register(meterRegistry)
            .increment();
    }

    /**
     * 记录评论创建
     */
    public void incrementCommentCreated(String type, String status) {
        Counter.builder("blog.comment.created")
            .description("评论创建总数")
            .tag("type", type != null ? type : "article")
            .tag("status", status != null ? status : "pending")
            .register(meterRegistry)
            .increment();
    }

    /**
     * 记录用户登录
     */
    public void incrementUserLogin(String loginType, boolean success) {
        Counter.builder("blog.user.login")
            .description("用户登录总数")
            .tag("type", loginType != null ? loginType : "password")
            .tag("success", String.valueOf(success))
            .register(meterRegistry)
            .increment();
    }

    /**
     * 记录文章查询耗时
     */
    public void recordArticleQuery(Duration duration, String queryType) {
        Timer.builder("blog.article.query")
            .description("文章查询耗时")
            .tag("type", queryType != null ? queryType : "list")
            .register(meterRegistry)
            .record(duration);
    }

    /**
     * 记录数据库查询耗时
     */
    public void recordDatabaseQuery(Duration duration, String operation, String table) {
        Timer.builder("blog.database.query")
            .description("数据库查询耗时")
            .tag("operation", operation != null ? operation : "select")
            .tag("table", table != null ? table : "unknown")
            .register(meterRegistry)
            .record(duration);
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
        return Timer.start(meterRegistry);
    }

    /**
     * 停止定时器并记录到指定指标
     */
    public void stopTimer(Timer.Sample sample, String metricName, Tags tags) {
        sample.stop(Timer.builder(metricName)
            .tags(tags)
            .register(meterRegistry));
    }

    /**
     * 记录Service方法耗时
     */
    public void recordServiceMethod(Duration duration, String className, String methodName) {
        Timer.builder("blog.service.method.duration")
            .description("Service方法执行耗时")
            .tag("class", className)
            .tag("method", methodName)
            .register(meterRegistry)
            .record(duration);
    }

    /**
     * 记录Controller请求耗时
     */
    public void recordControllerRequest(Duration duration, String controllerName, String methodName, String status, String... tags) {
        Timer.Builder builder = Timer.builder("blog.controller.request.duration")
            .description("Controller请求处理耗时")
            .tag("controller", controllerName)
            .tag("method", methodName)
            .tag("status", status);

        // 添加额外的标签（如错误类型）
        for (int i = 0; i < tags.length; i += 2) {
            if (i + 1 < tags.length) {
                builder.tag(tags[i], tags[i + 1]);
            }
        }

        builder.register(meterRegistry).record(duration);
    }

    /**
     * 记录数据库错误
     */
    public void recordDatabaseError(Duration duration, String mapperName, String methodName, String errorType) {
        Timer.builder("blog.database.error")
            .description("数据库操作错误")
            .tag("mapper", mapperName)
            .tag("method", methodName)
            .tag("error", errorType)
            .register(meterRegistry)
            .record(duration);
    }

    /**
     * 获取MeterRegistry实例
     */
    public MeterRegistry getMeterRegistry() {
        return meterRegistry;
    }
}