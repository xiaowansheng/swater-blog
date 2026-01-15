-- 更新状态枚举值从数字字符串改为语义化字符串
-- 执行日期: 2025-01-15
-- 说明: 将 talk, album, category, tag, picture 表的状态值从 '0', '1', '2' 改为 'draft', 'published', 'private'

-- 更新 talk 表状态
UPDATE `talk`
SET `status` = CASE
    WHEN `status` = '0' THEN 'draft'
    WHEN `status` = '1' THEN 'published'
    WHEN `status` = '2' THEN 'private'
    ELSE `status`
END
WHERE `status` IN ('0', '1', '2');

-- 更新 album 表状态
UPDATE `album`
SET `status` = CASE
    WHEN `status` = '0' THEN 'draft'
    WHEN `status` = '1' THEN 'published'
    WHEN `status` = '2' THEN 'private'
    ELSE `status`
END
WHERE `status` IN ('0', '1', '2');

-- 更新 category 表状态
UPDATE `category`
SET `status` = CASE
    WHEN `status` = '0' THEN 'draft'
    WHEN `status` = '1' THEN 'published'
    WHEN `status` = '2' THEN 'private'
    ELSE `status`
END
WHERE `status` IN ('0', '1', '2');

-- 更新 tag 表状态
UPDATE `tag`
SET `status` = CASE
    WHEN `status` = '0' THEN 'draft'
    WHEN `status` = '1' THEN 'published'
    WHEN `status` = '2' THEN 'private'
    ELSE `status`
END
WHERE `status` IN ('0', '1', '2');

-- 更新 picture 表状态
UPDATE `picture`
SET `status` = CASE
    WHEN `status` = '0' THEN 'draft'
    WHEN `status` = '1' THEN 'published'
    WHEN `status` = '2' THEN 'private'
    ELSE `status`
END
WHERE `status` IN ('0', '1', '2');

-- 添加注释说明
ALTER TABLE `talk` MODIFY COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'published' COMMENT '状态（draft-草稿，published-已发布，private-私密）';
ALTER TABLE `album` MODIFY COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'published' COMMENT '相册状态（draft-草稿，published-已发布，private-私密）';
ALTER TABLE `category` MODIFY COLUMN `status` VARCHAR(10) NOT NULL DEFAULT 'published' COMMENT '状态（draft-草稿，published-已发布，private-私密）';
ALTER TABLE `tag` MODIFY COLUMN `status` VARCHAR(10) NOT NULL DEFAULT 'published' COMMENT '标签状态（draft-草稿，published-已发布，private-私密）';
ALTER TABLE `picture` MODIFY COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'published' COMMENT '状态（draft-草稿，published-已发布，private-私密）';
