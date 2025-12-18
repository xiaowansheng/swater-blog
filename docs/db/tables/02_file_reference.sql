-- 文件引用关系表
DROP TABLE IF EXISTS `file_reference`;
CREATE TABLE `file_reference` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `file_id` BIGINT NOT NULL COMMENT '文件ID',
  `ref_type` VARCHAR(50) NOT NULL COMMENT '引用类型',
  `ref_id` BIGINT NOT NULL COMMENT '引用对象ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_ref_type_ref_id` (`ref_type`,`ref_id`),
  KEY `idx_create_time` (`create_time`),
  CONSTRAINT `fk_file_reference_file_id` FOREIGN KEY (`file_id`) REFERENCES `file_meta` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件引用关系表';

