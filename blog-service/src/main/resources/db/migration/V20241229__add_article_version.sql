-- 为文章表添加版本号字段（用于乐观锁）
ALTER TABLE `article` ADD COLUMN `version` BIGINT NOT NULL DEFAULT 1 COMMENT '版本号（乐观锁）' AFTER `comment_count`;

-- 创建索引
CREATE INDEX `idx_version` ON `article` (`version`);
