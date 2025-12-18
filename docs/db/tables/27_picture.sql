-- 图片表
DROP TABLE IF EXISTS `picture`;
CREATE TABLE `picture` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '图片ID',
  `user_id` BIGINT DEFAULT NULL COMMENT '图片上传人账号ID',
  `album_id` BIGINT NOT NULL COMMENT '相册ID',
  `name` VARCHAR(100) NOT NULL COMMENT '图片名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '图片描述',
  `url` VARCHAR(512) NOT NULL COMMENT '图片地址',
  `source` VARCHAR(20) DEFAULT NULL COMMENT '图片来源（0未知1原创2二创3转载）',
  `status` VARCHAR(20) NOT NULL DEFAULT '1' COMMENT '状态',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_album_id` (`album_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`),
  CONSTRAINT `fk_picture_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_picture_album_id` FOREIGN KEY (`album_id`) REFERENCES `album` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片表';

