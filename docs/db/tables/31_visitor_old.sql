-- 旧版访客信息表（兼容保留）
DROP TABLE IF EXISTS `visitor_old`;
CREATE TABLE `visitor_old` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '访客信息ID',
  `visitor_key` VARCHAR(256) NOT NULL COMMENT '访客唯一标识',
  `view_type` VARCHAR(20) NOT NULL COMMENT '访问类型',
  `view_id` BIGINT DEFAULT NULL COMMENT '访问对象ID',
  `ip` VARCHAR(100) NOT NULL COMMENT 'IP地址',
  `ip_address` VARCHAR(255) NOT NULL COMMENT 'IP地址信息',
  `country` VARCHAR(50) DEFAULT NULL COMMENT '国家',
  `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `location_detail` VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
  `device_info` VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
  `device` VARCHAR(50) NOT NULL DEFAULT '未知设备' COMMENT '设备',
  `browser` VARCHAR(50) NOT NULL DEFAULT '未知浏览器' COMMENT '浏览器',
  `point` POINT DEFAULT NULL COMMENT '坐标点',
  `location` VARCHAR(100) DEFAULT NULL COMMENT '位置',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_visitor_key` (`visitor_key`),
  KEY `idx_view_type` (`view_type`),
  KEY `idx_view_id` (`view_id`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='旧版访客信息表（兼容保留）';

