-- 标签表
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文章标签ID',
  `tag_key` VARCHAR(50) NOT NULL COMMENT '标签唯一标识',
  `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
  `slug` VARCHAR(100) DEFAULT NULL COMMENT '别名',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '颜色',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `status` VARCHAR(10) NOT NULL DEFAULT '1' COMMENT '标签状态（1-显示，0-隐藏）',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_key` (`tag_key`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签表';

