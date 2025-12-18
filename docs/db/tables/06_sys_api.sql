-- 接口资源表
DROP TABLE IF EXISTS `sys_api`;
CREATE TABLE `sys_api` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '资源菜单ID',
  `key` VARCHAR(50) NOT NULL COMMENT '资源唯一标识',
  `name` VARCHAR(100) NOT NULL COMMENT '资源名称',
  `path` VARCHAR(255) NOT NULL COMMENT '资源访问路径',
  `method` VARCHAR(10) NOT NULL COMMENT '请求方法',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '资源描述',
  `parent_id` BIGINT NOT NULL DEFAULT '0' COMMENT '父类ID',
  `is_open` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否开放资源（1开放0不开放）',
  `perms` VARCHAR(50) DEFAULT NULL COMMENT '权限标识',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`key`),
  UNIQUE KEY `uk_path_method` (`path`,`method`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_is_open` (`is_open`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='接口资源表';

