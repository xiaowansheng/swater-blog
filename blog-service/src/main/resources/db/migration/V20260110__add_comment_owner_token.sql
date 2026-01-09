-- Add owner_token to comment table for visitor self-visibility

SET @col_owner_token := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND column_name = 'owner_token'
);

SET @sql := IF(@col_owner_token = 0,
               'ALTER TABLE `comment` ADD COLUMN `owner_token` VARCHAR(128) DEFAULT NULL COMMENT ''游客会话标识，用于前端识别自己的评论'' AFTER `qq`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Optional index to speed up owner lookups
SET @idx_owner_token := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND index_name = 'idx_owner_token'
);
SET @sql := IF(@idx_owner_token = 0,
               'ALTER TABLE `comment` ADD INDEX `idx_owner_token` (`owner_token`);',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
