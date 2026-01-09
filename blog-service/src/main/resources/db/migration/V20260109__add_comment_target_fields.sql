-- Align comment table with unified target fields used in code

-- Add target_id column if missing
SET @col_target_id := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND column_name = 'target_id'
);
SET @sql := IF(@col_target_id = 0,
               'ALTER TABLE `comment` ADD COLUMN `target_id` BIGINT NULL COMMENT ''评论目标ID（文章/说说）'' AFTER `images`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add target_type column if missing
SET @col_target_type := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND column_name = 'target_type'
);
SET @sql := IF(@col_target_type = 0,
               'ALTER TABLE `comment` ADD COLUMN `target_type` VARCHAR(20) NULL COMMENT ''评论目标类型(ARTICLE/TALK)'' AFTER `target_id`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Migrate existing data from legacy columns when present
SET @col_post_id := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND column_name = 'post_id'
);
SET @col_moment_id := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND column_name = 'moment_id'
);

SET @sql := IF(@col_post_id > 0,
               'UPDATE `comment` SET target_id = post_id, target_type = IFNULL(target_type, ''ARTICLE'') WHERE target_id IS NULL AND post_id IS NOT NULL;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@col_moment_id > 0,
               'UPDATE `comment` SET target_id = moment_id, target_type = ''TALK'' WHERE target_id IS NULL AND moment_id IS NOT NULL;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fallback: ensure no NULLs remain before NOT NULL change
UPDATE `comment`
SET target_id = 0
WHERE target_id IS NULL;

UPDATE `comment`
SET target_type = 'ARTICLE'
WHERE target_type IS NULL;

-- Ensure new fields are not nullable
ALTER TABLE `comment`
    MODIFY COLUMN `target_id` BIGINT NOT NULL COMMENT '评论目标ID（文章/说说）',
    MODIFY COLUMN `target_type` VARCHAR(20) NOT NULL COMMENT '评论目标类型(ARTICLE/TALK)';

-- Drop legacy indexes if they exist
SET @idx_post := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND index_name = 'idx_post_id'
);
SET @sql := IF(@idx_post > 0,
               'ALTER TABLE `comment` DROP INDEX `idx_post_id`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_moment := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND index_name = 'idx_moment_id'
);
SET @sql := IF(@idx_moment > 0,
               'ALTER TABLE `comment` DROP INDEX `idx_moment_id`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Drop legacy columns if they exist
SET @sql := IF(@col_post_id > 0,
               'ALTER TABLE `comment` DROP COLUMN `post_id`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@col_moment_id > 0,
               'ALTER TABLE `comment` DROP COLUMN `moment_id`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add indexes for new fields when missing
SET @idx_target := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND index_name = 'idx_target_id'
);
SET @sql := IF(@idx_target = 0,
               'ALTER TABLE `comment` ADD INDEX `idx_target_id` (`target_id`);',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_target_type := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND index_name = 'idx_target_type'
);
SET @sql := IF(@idx_target_type = 0,
               'ALTER TABLE `comment` ADD INDEX `idx_target_type` (`target_type`);',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_target_status := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND index_name = 'idx_target_status_time'
);
SET @sql := IF(@idx_target_status = 0,
               'ALTER TABLE `comment` ADD INDEX `idx_target_status_time` (`target_id`, `target_type`, `status`, `create_time` DESC);',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
