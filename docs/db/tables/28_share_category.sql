-- 分享分类表
DROP TABLE IF EXISTS `share_category`;
CREATE TABLE `share_category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(30) NOT NULL COMMENT '分类名',
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '状态(1公开2私密)',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分享分类表';

