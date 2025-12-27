-- ========================================
-- 数据库分区策略脚本
-- 用于大数据量表的性能优化
-- ========================================

-- 1. 创建分区版本的日志表
-- 操作日志表分区（按月分区）
CREATE TABLE IF NOT EXISTS `log_operation_partitioned` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '操作日志ID',
  `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
  `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `operation_name` VARCHAR(100) NOT NULL COMMENT '操作名称',
  `method` VARCHAR(10) NOT NULL COMMENT '请求方法',
  `uri` VARCHAR(255) NOT NULL COMMENT '请求URI',
  `params` TEXT DEFAULT NULL COMMENT '请求参数',
  `result` TEXT DEFAULT NULL COMMENT '操作结果',
  `ip` VARCHAR(50) NOT NULL COMMENT 'IP地址',
  `ip_address` VARCHAR(255) DEFAULT NULL COMMENT 'IP地址信息',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
  `execution_time` INT DEFAULT NULL COMMENT '执行时间(ms)',
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '操作状态(1成功0失败)',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`, `create_time`),
  KEY `idx_user_time` (`user_id`, `create_time`),
  KEY `idx_operation_time` (`operation_type`, `create_time`),
  KEY `idx_ip_time` (`ip`, `create_time`),
  KEY `idx_status_time` (`status`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表(分区版)'
PARTITION BY RANGE (YEAR(create_time) * 100 + MONTH(create_time)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION p202404 VALUES LESS THAN (202405),
    PARTITION p202405 VALUES LESS THAN (202406),
    PARTITION p202406 VALUES LESS THAN (202407),
    PARTITION p202407 VALUES LESS THAN (202408),
    PARTITION p202408 VALUES LESS THAN (202409),
    PARTITION p202409 VALUES LESS THAN (202410),
    PARTITION p202410 VALUES LESS THAN (202411),
    PARTITION p202411 VALUES LESS THAN (202412),
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 2. 错误日志表分区
CREATE TABLE IF NOT EXISTS `log_error_partitioned` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '错误日志ID',
  `level` VARCHAR(10) NOT NULL COMMENT '日志级别',
  `logger` VARCHAR(255) NOT NULL COMMENT '日志记录器',
  `message` TEXT NOT NULL COMMENT '错误信息',
  `exception` LONGTEXT DEFAULT NULL COMMENT '异常堆栈',
  `method` VARCHAR(255) DEFAULT NULL COMMENT '方法名',
  `params` TEXT DEFAULT NULL COMMENT '方法参数',
  `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
  `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`, `create_time`),
  KEY `idx_level_time` (`level`, `create_time`),
  KEY `idx_logger_time` (`logger`, `create_time`),
  KEY `idx_user_time` (`user_id`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='错误日志表(分区版)'
PARTITION BY RANGE (YEAR(create_time) * 100 + MONTH(create_time)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION p202404 VALUES LESS THAN (202405),
    PARTITION p202405 VALUES LESS THAN (202406),
    PARTITION p202406 VALUES LESS THAN (202407),
    PARTITION p202407 VALUES LESS THAN (202408),
    PARTITION p202408 VALUES LESS THAN (202409),
    PARTITION p202409 VALUES LESS THAN (202410),
    PARTITION p202410 VALUES LESS THAN (202411),
    PARTITION p202411 VALUES LESS THAN (202412),
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 3. 访问统计表分区（按日分区，适合高频访问统计）
CREATE TABLE IF NOT EXISTS `visit_statistics_partitioned` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `date` DATE NOT NULL COMMENT '统计日期',
  `page_path` VARCHAR(255) NOT NULL COMMENT '页面路径',
  `page_title` VARCHAR(255) DEFAULT NULL COMMENT '页面标题',
  `pv` INT NOT NULL DEFAULT '0' COMMENT '页面浏览量',
  `uv` INT NOT NULL DEFAULT '0' COMMENT '独立访客数',
  `ip_count` INT NOT NULL DEFAULT '0' COMMENT 'IP数量',
  `bounce_rate` DECIMAL(5,2) DEFAULT '0.00' COMMENT '跳出率',
  `avg_duration` INT DEFAULT '0' COMMENT '平均停留时间(秒)',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`, `date`),
  UNIQUE KEY `uk_date_path` (`date`, `page_path`),
  KEY `idx_date_pv` (`date`, `pv` DESC),
  KEY `idx_path_date` (`page_path`, `date` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访问统计表(分区版)'
PARTITION BY RANGE (TO_DAYS(date)) (
    PARTITION p20240101 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p20240201 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    PARTITION p20240301 VALUES LESS THAN (TO_DAYS('2024-04-01')),
    PARTITION p20240401 VALUES LESS THAN (TO_DAYS('2024-05-01')),
    PARTITION p20240501 VALUES LESS THAN (TO_DAYS('2024-06-01')),
    PARTITION p20240601 VALUES LESS THAN (TO_DAYS('2024-07-01')),
    PARTITION p20240701 VALUES LESS THAN (TO_DAYS('2024-08-01')),
    PARTITION p20240801 VALUES LESS THAN (TO_DAYS('2024-09-01')),
    PARTITION p20240901 VALUES LESS THAN (TO_DAYS('2024-10-01')),
    PARTITION p20241001 VALUES LESS THAN (TO_DAYS('2024-11-01')),
    PARTITION p20241101 VALUES LESS THAN (TO_DAYS('2024-12-01')),
    PARTITION p20241201 VALUES LESS THAN (TO_DAYS('2025-01-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ========================================
-- 分区管理存储过程
-- ========================================

-- 创建自动添加分区的存储过程
DELIMITER $$

CREATE PROCEDURE `AddMonthlyPartition`(
    IN table_name VARCHAR(64),
    IN months_ahead INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE partition_name VARCHAR(64);
    DECLARE partition_value VARCHAR(64);
    DECLARE target_date DATE;
    DECLARE i INT DEFAULT 1;
    
    WHILE i <= months_ahead DO
        SET target_date = DATE_ADD(CURDATE(), INTERVAL i MONTH);
        SET partition_name = CONCAT('p', DATE_FORMAT(target_date, '%Y%m'));
        SET partition_value = DATE_FORMAT(DATE_ADD(target_date, INTERVAL 1 MONTH), '%Y%m');
        
        SET @sql = CONCAT('ALTER TABLE ', table_name, 
                         ' ADD PARTITION (PARTITION ', partition_name,
                         ' VALUES LESS THAN (', partition_value, '))');
        
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET i = i + 1;
    END WHILE;
END$$

-- 创建删除旧分区的存储过程
CREATE PROCEDURE `DropOldPartitions`(
    IN table_name VARCHAR(64),
    IN months_to_keep INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE partition_name VARCHAR(64);
    DECLARE cutoff_date DATE;
    
    SET cutoff_date = DATE_SUB(CURDATE(), INTERVAL months_to_keep MONTH);
    
    -- 这里需要根据实际的分区命名规则来删除旧分区
    -- 示例：删除6个月前的分区
    SET @sql = CONCAT('ALTER TABLE ', table_name, 
                     ' DROP PARTITION p', DATE_FORMAT(cutoff_date, '%Y%m'));
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;

-- ========================================
-- 分区维护事件调度器
-- ========================================

-- 启用事件调度器
SET GLOBAL event_scheduler = ON;

-- 创建每月自动添加分区的事件
CREATE EVENT IF NOT EXISTS `monthly_partition_maintenance`
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-01-01 00:00:00'
DO
BEGIN
    -- 为日志表添加未来3个月的分区
    CALL AddMonthlyPartition('log_operation_partitioned', 3);
    CALL AddMonthlyPartition('log_error_partitioned', 3);
    
    -- 删除12个月前的旧分区（保留12个月数据）
    CALL DropOldPartitions('log_operation_partitioned', 12);
    CALL DropOldPartitions('log_error_partitioned', 12);
END;

-- ========================================
-- 分区信息查询
-- ========================================

-- 查看分区信息的查询语句
-- SELECT 
--     TABLE_NAME,
--     PARTITION_NAME,
--     PARTITION_ORDINAL_POSITION,
--     PARTITION_METHOD,
--     PARTITION_EXPRESSION,
--     PARTITION_DESCRIPTION,
--     TABLE_ROWS,
--     AVG_ROW_LENGTH,
--     DATA_LENGTH
-- FROM 
--     INFORMATION_SCHEMA.PARTITIONS 
-- WHERE 
--     TABLE_SCHEMA = 'blog' 
--     AND PARTITION_NAME IS NOT NULL
-- ORDER BY 
--     TABLE_NAME, PARTITION_ORDINAL_POSITION;

-- ========================================
-- 使用说明
-- ========================================
-- 1. 分区表适用于大数据量的日志类表
-- 2. 分区键必须包含在主键中
-- 3. 定期维护分区，删除旧数据
-- 4. 监控分区性能和存储使用情况
-- 5. 查询时尽量包含分区键以提高性能