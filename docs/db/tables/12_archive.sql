-- 归档表
DROP TABLE IF EXISTS `archive`;
CREATE TABLE `archive` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '归档ID',
  `year` INT NOT NULL COMMENT '年份',
  `month` INT NOT NULL COMMENT '月份',
  `post_count` INT NOT NULL DEFAULT '0' COMMENT '文章数量',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_year_month` (`year`,`month`),
  KEY `idx_year` (`year`),
  KEY `idx_month` (`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='归档表';

