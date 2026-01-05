package com.blog.ops.health;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
/**
 * 自定义健康检查指示器
 */
@Component
@ConditionalOnProperty(name = "health.custom.enabled", havingValue = "true")
public class CustomHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        
        try {
            // 检查数据库连接
            boolean dbHealthy = checkDatabase();
            
            // 检查Redis连接
            boolean redisHealthy = checkRedis();
            
            // 检查磁盘空间
            boolean diskHealthy = checkDiskSpace();
            
            if (dbHealthy && redisHealthy && diskHealthy) {
                builder.up()
                    .withDetail("database", "UP")
                    .withDetail("redis", "UP")
                    .withDetail("disk", "UP")
                    .withDetail("message", "所有组件运行正常");
            } else {
                builder.down()
                    .withDetail("database", dbHealthy ? "UP" : "DOWN")
                    .withDetail("redis", redisHealthy ? "UP" : "DOWN")
                    .withDetail("disk", diskHealthy ? "UP" : "DOWN")
                    .withDetail("message", "部分组件异常");
            }
            
        } catch (Exception e) {
            builder.down()
                .withDetail("error", e.getMessage())
                .withDetail("message", "健康检查异常");
        }
        
        return builder.build();
    }
    
    /**
     * 检查数据库连接
     */
    private boolean checkDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(3); // 3秒超时
        } catch (SQLException e) {
            return false;
        }
    }
    
    /**
     * 检查Redis连接
     */
    private boolean checkRedis() {
        try {
            String pong = redisTemplate.getConnectionFactory()
                .getConnection()
                .ping();
            return "PONG".equals(pong);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 检查磁盘空间
     */
    private boolean checkDiskSpace() {
        try {
            long freeSpace = java.io.File.listRoots()[0].getFreeSpace();
            long totalSpace = java.io.File.listRoots()[0].getTotalSpace();
            double freePercentage = (double) freeSpace / totalSpace * 100;
            
            // 如果可用空间小于10%，认为不健康
            return freePercentage > 10.0;
        } catch (Exception e) {
            return true; // 检查失败时默认为健康
        }
    }
}