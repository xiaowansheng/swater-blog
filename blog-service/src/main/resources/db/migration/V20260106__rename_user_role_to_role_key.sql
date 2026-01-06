-- 重命名用户表的role字段为role_key
-- 这个迁移将user表的role字段重命名为role_key，以保持与role表的一致性
-- 将role字段名改为role_key，并增加字段长度以适应更长的角色标识

-- 重命名字段
ALTER TABLE `user` CHANGE COLUMN `role` `role_key` VARCHAR(50) DEFAULT 'user' COMMENT '角色标签';
