package com.blog.task;

import com.blog.mapper.ArticleMapper;
import com.blog.mapper.UserMapper;
import com.blog.metrics.BlogMetrics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 监控指标更新定时任务
 */
@Component
public class MetricsUpdateTask {
    
    @Autowired
    private BlogMetrics blogMetrics;
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 每5分钟更新一次统计指标
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void updateStatistics() {
        try {
            // 更新文章总数
            Long totalArticles = articleMapper.selectCount(null);
            blogMetrics.updateTotalArticles(totalArticles);
            
            // 更新活跃用户数（这里简化为总用户数，实际应该统计最近活跃的用户）
            Long totalUsers = userMapper.selectCount(null);
            blogMetrics.updateActiveUsers(totalUsers);
            
        } catch (Exception e) {
            // 记录错误但不影响应用运行
            System.err.println("更新监控指标失败: " + e.getMessage());
        }
    }
}