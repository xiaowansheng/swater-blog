-- 1. 添加 target_id 和 target_type 字段
ALTER TABLE comment ADD COLUMN target_id BIGINT COMMENT '目标ID';
ALTER TABLE comment ADD COLUMN target_type VARCHAR(50) COMMENT '目标类型 (ARTICLE, TALK)';

-- 2. 迁移存量数据
-- 将 postId 迁移到 target_id，并设置类型为 ARTICLE
UPDATE comment SET target_id = post_id, target_type = 'ARTICLE' WHERE post_id IS NOT NULL;

-- 将 momentId 迁移到 target_id，并设置类型为 TALK
UPDATE comment SET target_id = moment_id, target_type = 'TALK' WHERE moment_id IS NOT NULL;

-- 3. 删除旧字段
ALTER TABLE comment DROP COLUMN post_id;
ALTER TABLE comment DROP COLUMN moment_id;

-- 4. 添加索引以优化查询
CREATE INDEX idx_comment_target ON comment(target_id, target_type);
