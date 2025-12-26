-- ========================================
-- 查询优化配置脚本
-- MySQL配置优化和慢查询监控
-- ========================================

-- 1. MySQL配置优化建议
-- 以下配置需要在MySQL配置文件(my.cnf)中设置

/*
# ========================================
# MySQL配置优化建议 (my.cnf)
# ========================================

[mysqld]
# 基础配置
port = 3306
bind-address = 0.0.0.0
default-storage-engine = InnoDB
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 连接配置
max_connections = 200
max_connect_errors = 1000
wait_timeout = 28800
interactive_timeout = 28800

# InnoDB配置
innodb_buffer_pool_size = 1G  # 设置为可用内存的70-80%
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M
innodb_flush_log_at_trx_commit = 2
innodb_file_per_table = 1
innodb_open_files = 300

# 查询缓存（MySQL 8.0已移除）
# query_cache_type = 1
# query_cache_size = 64M

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2
log_queries_not_using_indexes = 1
log_throttle_queries_not_using_indexes = 10

# 二进制日志
log_bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7

# 其他优化
tmp_table_size = 64M
max_heap_table_size = 64M
sort_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
myisam_sort_buffer_size = 64M
thread_cache_size = 8
table_open_cache = 1024
*/

-- ========================================
-- 2. 慢查询分析和优化
-- ========================================

-- 启用慢查询日志（运行时设置）
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- 查看当前慢查询配置
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- 查看慢查询统计
SHOW GLOBAL STATUS LIKE 'Slow_queries';

-- ========================================
-- 3. 常用查询优化示例
-- ========================================

-- 优化前：文章列表查询（可能的慢查询）
-- SELECT a.*, c.name as category_name, u.nickname as author_name
-- FROM article a
-- LEFT JOIN category c ON a.category_id = c.id
-- LEFT JOIN user u ON a.author_id = u.id
-- WHERE a.status = 1 AND a.deleted = 0
-- ORDER BY a.is_top DESC, a.published_at DESC
-- LIMIT 0, 10;

-- 优化后：使用复合索引
-- 已在01-index-optimization.sql中创建了 idx_status_published_top 索引

-- 优化前：评论查询（N+1问题）
-- SELECT * FROM comment WHERE post_id = ? ORDER BY create_time ASC;
-- 然后为每个评论查询用户信息

-- 优化后：使用JOIN一次性获取
-- SELECT c.*, u.nickname, u.avatar
-- FROM comment c
-- LEFT JOIN user u ON c.user_id = u.id
-- WHERE c.post_id = ? AND c.status = 1 AND c.deleted = 0
-- ORDER BY c.create_time ASC;

-- ========================================
-- 4. 查询性能分析工具
-- ========================================

-- 使用EXPLAIN分析查询计划
-- EXPLAIN SELECT * FROM article WHERE status = 1 ORDER BY published_at DESC LIMIT 10;

-- 使用EXPLAIN FORMAT=JSON获取详细信息
-- EXPLAIN FORMAT=JSON SELECT * FROM article WHERE status = 1 ORDER BY published_at DESC LIMIT 10;

-- 分析表统计信息
-- ANALYZE TABLE article;
-- ANALYZE TABLE comment;
-- ANALYZE TABLE user;

-- 查看索引使用情况
-- SHOW INDEX FROM article;
-- SHOW INDEX FROM comment;

-- ========================================
-- 5. 性能监控查询
-- ========================================

-- 查看当前连接数
SELECT 
    VARIABLE_NAME,
    VARIABLE_VALUE
FROM 
    INFORMATION_SCHEMA.GLOBAL_STATUS 
WHERE 
    VARIABLE_NAME IN ('Threads_connected', 'Threads_running', 'Max_used_connections');

-- 查看InnoDB状态
SELECT 
    VARIABLE_NAME,
    VARIABLE_VALUE
FROM 
    INFORMATION_SCHEMA.GLOBAL_STATUS 
WHERE 
    VARIABLE_NAME LIKE 'Innodb%'
    AND VARIABLE_NAME IN (
        'Innodb_buffer_pool_read_requests',
        'Innodb_buffer_pool_reads',
        'Innodb_buffer_pool_pages_total',
        'Innodb_buffer_pool_pages_free'
    );

-- 计算缓冲池命中率
SELECT 
    ROUND(
        (1 - (
            (SELECT VARIABLE_VALUE FROM INFORMATION_SCHEMA.GLOBAL_STATUS WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') /
            (SELECT VARIABLE_VALUE FROM INFORMATION_SCHEMA.GLOBAL_STATUS WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests')
        )) * 100, 2
    ) AS buffer_pool_hit_rate_percent;

-- 查看表大小和行数
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS data_size_mb,
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS index_size_mb,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS total_size_mb
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_SCHEMA = 'blog'
    AND TABLE_TYPE = 'BASE TABLE'
ORDER BY 
    (DATA_LENGTH + INDEX_LENGTH) DESC;

-- 查看未使用的索引
SELECT 
    s.TABLE_SCHEMA,
    s.TABLE_NAME,
    s.INDEX_NAME,
    s.COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.STATISTICS s
    LEFT JOIN INFORMATION_SCHEMA.INDEX_STATISTICS i 
        ON s.TABLE_SCHEMA = i.TABLE_SCHEMA 
        AND s.TABLE_NAME = i.TABLE_NAME 
        AND s.INDEX_NAME = i.INDEX_NAME
WHERE 
    s.TABLE_SCHEMA = 'blog'
    AND i.INDEX_NAME IS NULL
    AND s.INDEX_NAME != 'PRIMARY';

-- ========================================
-- 6. 定期维护脚本
-- ========================================

-- 优化表（重建索引和统计信息）
-- 建议在业务低峰期执行
-- OPTIMIZE TABLE article;
-- OPTIMIZE TABLE comment;
-- OPTIMIZE TABLE user;

-- 分析表（更新统计信息）
-- ANALYZE TABLE article;
-- ANALYZE TABLE comment;
-- ANALYZE TABLE user;

-- 检查表完整性
-- CHECK TABLE article;
-- CHECK TABLE comment;
-- CHECK TABLE user;

-- ========================================
-- 7. 查询优化最佳实践
-- ========================================

/*
1. 索引优化原则：
   - 为WHERE、ORDER BY、GROUP BY字段创建索引
   - 复合索引遵循最左前缀原则
   - 避免在索引列上使用函数
   - 选择性高的列放在复合索引前面

2. 查询优化原则：
   - 避免SELECT *，只查询需要的字段
   - 使用LIMIT限制结果集大小
   - 避免在WHERE子句中使用函数
   - 使用EXISTS代替IN（子查询较大时）
   - 合理使用JOIN，避免笛卡尔积

3. 表设计原则：
   - 选择合适的数据类型
   - 避免NULL值，使用默认值
   - 合理使用分区表
   - 定期清理历史数据

4. 监控和维护：
   - 定期分析慢查询日志
   - 监控数据库性能指标
   - 定期更新表统计信息
   - 及时清理无用索引
*/

-- ========================================
-- 8. 应用层优化建议
-- ========================================

/*
1. 连接池配置：
   - 合理设置连接池大小
   - 设置连接超时时间
   - 启用连接验证

2. 缓存策略：
   - 使用Redis缓存热点数据
   - 实现多级缓存
   - 合理设置缓存过期时间

3. 分页优化：
   - 使用游标分页代替OFFSET
   - 缓存总数统计
   - 延迟加载非关键数据

4. 批量操作：
   - 使用批量插入/更新
   - 合理控制批次大小
   - 使用事务保证一致性
*/