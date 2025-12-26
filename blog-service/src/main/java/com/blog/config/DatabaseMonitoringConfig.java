package com.blog.config;

import com.blog.metrics.BlogMetrics;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Properties;

/**
 * 数据库性能监控配置
 */
@Configuration
public class DatabaseMonitoringConfig {
    
    /**
     * MyBatis SQL执行监控拦截器
     */
    @Component
    @Intercepts({
        @Signature(type = Executor.class, method = "query", 
                  args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}),
        @Signature(type = Executor.class, method = "update", 
                  args = {MappedStatement.class, Object.class})
    })
    public static class SqlExecutionInterceptor implements Interceptor {
        
        @Autowired
        private BlogMetrics blogMetrics;
        
        @Autowired
        private MeterRegistry meterRegistry;
        
        @Override
        public Object intercept(Invocation invocation) throws Throwable {
            Instant start = Instant.now();
            MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
            
            try {
                Object result = invocation.proceed();
                
                // 记录成功的SQL执行
                recordSqlExecution(mappedStatement, start, true, null);
                
                return result;
                
            } catch (Exception e) {
                // 记录失败的SQL执行
                recordSqlExecution(mappedStatement, start, false, e);
                throw e;
            }
        }
        
        private void recordSqlExecution(MappedStatement mappedStatement, Instant start, 
                                      boolean success, Exception exception) {
            Duration duration = Duration.between(start, Instant.now());
            String sqlId = mappedStatement.getId();
            String operation = getSqlOperation(mappedStatement);
            String table = getTableName(sqlId);
            
            // 记录到业务指标
            blogMetrics.recordDatabaseQuery(duration, operation, table);
            
            // 记录到Micrometer指标
            Timer.Builder timerBuilder = Timer.builder("blog.sql.execution")
                    .description("SQL执行时间")
                    .tag("sql_id", sqlId)
                    .tag("operation", operation)
                    .tag("table", table)
                    .tag("success", String.valueOf(success));
            
            if (!success && exception != null) {
                timerBuilder.tag("error", exception.getClass().getSimpleName());
            }
            
            timerBuilder.register(meterRegistry).record(duration);
            
            // 记录慢查询
            if (duration.toMillis() > 1000) { // 超过1秒的查询
                Timer.builder("blog.sql.slow")
                        .description("慢查询")
                        .tag("sql_id", sqlId)
                        .tag("operation", operation)
                        .tag("table", table)
                        .register(meterRegistry)
                        .record(duration);
            }
        }
        
        private String getSqlOperation(MappedStatement mappedStatement) {
            String sqlId = mappedStatement.getId().toLowerCase();
            if (sqlId.contains("select") || sqlId.contains("query") || sqlId.contains("find")) {
                return "select";
            } else if (sqlId.contains("insert") || sqlId.contains("save")) {
                return "insert";
            } else if (sqlId.contains("update")) {
                return "update";
            } else if (sqlId.contains("delete")) {
                return "delete";
            }
            return "unknown";
        }
        
        private String getTableName(String sqlId) {
            // 从Mapper接口名推断表名
            String[] parts = sqlId.split("\\.");
            if (parts.length >= 2) {
                String mapperName = parts[parts.length - 2];
                if (mapperName.endsWith("Mapper")) {
                    return mapperName.substring(0, mapperName.length() - 6).toLowerCase();
                }
            }
            return "unknown";
        }
        
        @Override
        public Object plugin(Object target) {
            return Plugin.wrap(target, this);
        }
        
        @Override
        public void setProperties(Properties properties) {
            // 可以从配置文件读取属性
        }
    }
}