-- 登录日志表
DROP TABLE IF EXISTS `login_log`;
CREATE TABLE `login_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '登录日志ID',
  `user_id` BIGINT NOT NULL COMMENT '用户账号ID',
  `ip` VARCHAR(50) NOT NULL COMMENT 'IP地址',
  `ip_address` VARCHAR(255) NOT NULL COMMENT 'IP地址信息',
  `country` VARCHAR(50) DEFAULT NULL COMMENT '国家',
  `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `location_detail` VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
  `device_info` VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
  `device` VARCHAR(50) NOT NULL DEFAULT '未知设备' COMMENT '设备名称',
  `browser` VARCHAR(50) NOT NULL DEFAULT '未知浏览器' COMMENT '浏览器信息',
  `point` POINT DEFAULT NULL COMMENT '坐标',
  `location` VARCHAR(100) DEFAULT NULL COMMENT '位置',
  `ip_source` VARCHAR(100) DEFAULT NULL COMMENT 'ip来源',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_deleted` (`deleted`),
  CONSTRAINT `fk_login_log_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

