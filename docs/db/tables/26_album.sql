-- 相册表
DROP TABLE IF EXISTS `album`;
CREATE TABLE `album` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '相册ID',
  `album_key` VARCHAR(50) NOT NULL COMMENT '相册唯一标识',
  `user_id` BIGINT DEFAULT NULL COMMENT '相册创建人账号ID',
  `name` VARCHAR(50) NOT NULL COMMENT '相册名称',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '相册描述',
  `cover` VARCHAR(255) DEFAULT NULL COMMENT '相册封面',
  `status` VARCHAR(20) NOT NULL DEFAULT '1' COMMENT '相册状态（1公开2私密）',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_album_key` (`album_key`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`),
  CONSTRAINT `fk_album_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册表';

