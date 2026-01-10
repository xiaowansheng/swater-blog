-- Add owner_token to comment table for visitor self-visibility

SET @col_owner_token := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND column_name = 'owner_token'
);

SET @sql := IF(@col_owner_token = 0,
               'ALTER TABLE `comment` ADD COLUMN `owner_token` VARCHAR(128) DEFAULT NULL COMMENT ''游客会话标识，用于前端识别自己的评论'' AFTER `qq`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure root_id column exists and is populated
SET @col_root_id := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND column_name = 'root_id'
);
SET @sql := IF(@col_root_id = 0,
               'ALTER TABLE `comment` ADD COLUMN `root_id` BIGINT NOT NULL DEFAULT 0 COMMENT ''顶级评论ID'' AFTER `parent_id`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill root_id: root_id = id for top-level; else inherit from parent/root
UPDATE `comment` SET root_id = id WHERE parent_id = 0 OR parent_id IS NULL;
UPDATE `comment` c
LEFT JOIN `comment` p ON c.parent_id = p.id
SET c.root_id = COALESCE(p.root_id, p.id, c.root_id)
WHERE c.parent_id IS NOT NULL AND c.parent_id <> 0;

-- Ensure root_id is not null
UPDATE `comment` SET root_id = id WHERE root_id IS NULL;

-- Optional index to speed up owner lookups
SET @idx_owner_token := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND index_name = 'idx_owner_token'
);
SET @sql := IF(@idx_owner_token = 0,
               'ALTER TABLE `comment` ADD INDEX `idx_owner_token` (`owner_token`);',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
