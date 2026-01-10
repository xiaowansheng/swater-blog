-- Drop owner_token from comment table (replaced by email verification session token)

SET @idx_owner_token := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND index_name = 'idx_owner_token'
);
SET @sql := IF(@idx_owner_token > 0,
               'ALTER TABLE `comment` DROP INDEX `idx_owner_token`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_owner_token := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'comment' AND column_name = 'owner_token'
);
SET @sql := IF(@col_owner_token > 0,
               'ALTER TABLE `comment` DROP COLUMN `owner_token`;',
               'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

