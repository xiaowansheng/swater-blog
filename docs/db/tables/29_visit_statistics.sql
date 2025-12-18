-- 访问统计表
DROP TABLE IF EXISTS `visit_statistics`;
CREATE TABLE `visit_statistics` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `page_type` VARCHAR(20) NOT NULL COMMENT '页面类型',
  `page_id` VARCHAR(64) DEFAULT NULL COMMENT '页面ID',
  `statistics_date` DATETIME NOT NULL COMMENT '统计日期',
  `visit_count` BIGINT NOT NULL DEFAULT '0' COMMENT '访问量',
  `unique_visitor_count` BIGINT NOT NULL DEFAULT '0' COMMENT '独立访客数',
  `page_view_count` BIGINT NOT NULL DEFAULT '0' COMMENT '页面浏览量',
  `geo_statistics` TEXT DEFAULT NULL COMMENT '地理位置统计(JSON)',
  `device_statistics` TEXT DEFAULT NULL COMMENT '设备统计(JSON)',
  `browser_statistics` TEXT DEFAULT NULL COMMENT '浏览器统计(JSON)',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_type_page_id_date` (`page_type`,`page_id`,`statistics_date`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_statistics_date` (`statistics_date`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访问量统计表';

