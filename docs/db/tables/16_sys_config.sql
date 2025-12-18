-- 配置表
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `name` VARCHAR(50) NOT NULL COMMENT '配置参数显示名称',
  `value` TEXT NOT NULL COMMENT '配置值',
  `type` VARCHAR(20) NOT NULL DEFAULT 'string' COMMENT '类型（string/int/boolean/json）',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `group_name` VARCHAR(50) DEFAULT NULL COMMENT '分组',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`),
  KEY `idx_group_name` (`group_name`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网站配置信息表';

