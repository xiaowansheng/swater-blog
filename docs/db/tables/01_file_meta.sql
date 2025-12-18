-- 文件元数据表
DROP TABLE IF EXISTS `file_meta`;
CREATE TABLE `file_meta` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `file_hash` VARCHAR(64) NOT NULL COMMENT '文件哈希值',
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `file_type` VARCHAR(50) NOT NULL COMMENT '文件类型',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件存储路径',
  `url` VARCHAR(500) DEFAULT NULL COMMENT '访问URL',
  `file_size` BIGINT NOT NULL COMMENT '文件大小(字节)',
  `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
  `upload_user_id` BIGINT DEFAULT NULL COMMENT '上传用户ID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '文件状态',
  `ref_count` INT NOT NULL DEFAULT '0' COMMENT '引用计数',
  `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '删除标记(0:未删除, 1:已删除)',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_file_hash` (`file_hash`),
  KEY `idx_status` (`status`),
  KEY `idx_upload_user_id` (`upload_user_id`),
  KEY `idx_file_type` (`file_type`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件元数据表';

