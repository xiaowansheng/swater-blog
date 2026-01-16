-- 友链表重构：移除status字段，保留isVisible和reviewStatus
-- 执行日期：请根据实际情况填写

-- 1. 删除status字段的索引
DROP INDEX IF EXISTS `idx_status` ON `friend_link`;

-- 2. 删除status字段
ALTER TABLE `friend_link` DROP COLUMN IF EXISTS `status`;

-- 3. 添加新的索引以优化查询性能
CREATE INDEX `idx_review_status` ON `friend_link` (`review_status`);
CREATE INDEX `idx_is_visible` ON `friend_link` (`is_visible`);

-- 4. 更新字段注释以更清晰地说明含义
ALTER TABLE `friend_link` MODIFY COLUMN `is_visible` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否可见（0-不可见，1-可见）';
ALTER TABLE `friend_link` MODIFY COLUMN `review_status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '审核状态（0-待审核，1-已审核，2-已拒绝）';

-- 5. 数据迁移：将已审核且启用的友链设置为可见
-- 如果原status=1且reviewStatus=1，则设置isVisible=1
UPDATE `friend_link` SET `is_visible` = 1 WHERE `review_status` = 1;
