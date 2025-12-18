-- 菜单表
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `key` VARCHAR(50) NOT NULL COMMENT '菜单唯一标识',
  `title` VARCHAR(50) NOT NULL COMMENT '菜单标题',
  `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标',
  `redirect` VARCHAR(100) DEFAULT NULL COMMENT '路由重定向',
  `path` VARCHAR(100) NOT NULL COMMENT '路由地址',
  `component` VARCHAR(200) DEFAULT NULL COMMENT '组件路径',
  `hidden` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '隐藏菜单（0展示1隐藏）',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `parent_id` BIGINT NOT NULL DEFAULT '0' COMMENT '父类ID',
  `perms` VARCHAR(50) DEFAULT NULL COMMENT '权限标识',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述信息',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_key` (`key`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort` (`sort`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单目录表';

