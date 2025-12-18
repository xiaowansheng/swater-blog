-- 分类表
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `category_key` VARCHAR(50) NOT NULL COMMENT '分类唯一标识',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(100) DEFAULT NULL COMMENT '别名',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `parent_id` BIGINT NOT NULL DEFAULT '0' COMMENT '父级ID',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `status` VARCHAR(10) NOT NULL DEFAULT '1' COMMENT '状态（1-显示，0-隐藏）',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否被删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_key` (`category_key`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章类别表';

