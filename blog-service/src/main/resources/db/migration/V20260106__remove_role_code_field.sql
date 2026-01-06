-- 移除角色表的code字段及相关索引
-- 这个迁移删除了role表中的code字段和uk_code唯一索引
-- 因为code字段与role_key字段功能重复，实际业务中只使用role_key

-- 删除code字段的唯一索引
ALTER TABLE `role` DROP INDEX `uk_code`;

-- 删除code字段
ALTER TABLE `role` DROP COLUMN `code`;
