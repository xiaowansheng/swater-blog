-- ========================================
-- 数据库索引优化脚本
-- 执行前请备份数据库
-- ========================================

-- 1. 文章表索引优化
-- 文章列表查询优化（最常用的查询场景）
ALTER TABLE `article` ADD INDEX `idx_status_published_top` (`status`, `published_at` DESC, `is_top` DESC);

-- 分类文章查询优化
ALTER TABLE `article` ADD INDEX `idx_category_status_published` (`category_id`, `status`, `published_at` DESC);

-- 作者文章查询优化
ALTER TABLE `article` ADD INDEX `idx_author_status_time` (`author_id`, `status`, `create_time` DESC);

-- 热门文章查询优化（按浏览量、点赞数）
ALTER TABLE `article` ADD INDEX `idx_status_view_count` (`status`, `view_count` DESC);
ALTER TABLE `article` ADD INDEX `idx_status_like_count` (`status`, `like_count` DESC);

-- 全文搜索索引（标题和内容）
ALTER TABLE `article` ADD FULLTEXT INDEX `ft_title_content` (`title`, `content`);

-- 2. 评论表索引优化
-- 文章评论查询优化
ALTER TABLE `comment` ADD INDEX `idx_post_status_time` (`post_id`, `status`, `create_time` DESC);

-- 用户评论查询优化
ALTER TABLE `comment` ADD INDEX `idx_user_status_time` (`user_id`, `status`, `create_time` DESC);

-- 评论回复查询优化
ALTER TABLE `comment` ADD INDEX `idx_parent_root_time` (`parent_id`, `root_id`, `create_time` ASC);

-- 评论审核查询优化
ALTER TABLE `comment` ADD INDEX `idx_status_visible_time` (`status`, `is_visible`, `create_time` DESC);

-- 3. 用户表索引优化
-- 用户登录查询优化
ALTER TABLE `user` ADD INDEX `idx_status_disabled` (`status`, `disabled`);

-- 用户角色查询优化（如果经常按角色查询）
ALTER TABLE `user` ADD INDEX `idx_role_status` (`role`, `status`);

-- 最后登录时间查询优化
ALTER TABLE `user` ADD INDEX `idx_last_login_time` (`last_login_time` DESC);

-- 4. 分类标签表索引优化
-- 分类状态查询优化
ALTER TABLE `category` ADD INDEX `idx_status_sort` (`status`, `sort` ASC);

-- 标签状态查询优化
ALTER TABLE `tag` ADD INDEX `idx_status_name` (`status`, `name` ASC);

-- 5. 文件表索引优化
-- 文件状态和类型查询优化
ALTER TABLE `file_meta` ADD INDEX `idx_status_type_time` (`status`, `file_type`, `create_time` DESC);

-- 用户文件查询优化
ALTER TABLE `file_meta` ADD INDEX `idx_user_status_time` (`upload_user_id`, `status`, `create_time` DESC);

-- 6. 说说表索引优化
-- 说说列表查询优化
ALTER TABLE `talk` ADD INDEX `idx_status_top_time` (`status`, `is_top` DESC, `create_time` DESC);

-- 用户说说查询优化
ALTER TABLE `talk` ADD INDEX `idx_author_status_time` (`author_id`, `status`, `create_time` DESC);

-- 7. 系统表索引优化
-- 配置查询优化
ALTER TABLE `sys_config` ADD INDEX `idx_group_sort` (`group_name`, `sort` ASC);

-- API资源查询优化
ALTER TABLE `sys_api` ADD INDEX `idx_parent_sort` (`parent_id`, `sort` ASC);

-- 8. 日志表索引优化（如果存在）
-- 注意：日志表建议使用分区，这里先添加基础索引

-- 操作日志查询优化
-- ALTER TABLE `log_operation` ADD INDEX `idx_user_time` (`user_id`, `create_time` DESC);
-- ALTER TABLE `log_operation` ADD INDEX `idx_operation_time` (`operation_type`, `create_time` DESC);

-- 错误日志查询优化
-- ALTER TABLE `log_error` ADD INDEX `idx_level_time` (`level`, `create_time` DESC);

-- ========================================
-- 索引使用情况检查
-- ========================================

-- 检查索引使用情况的查询语句
-- SELECT 
--     TABLE_NAME,
--     INDEX_NAME,
--     COLUMN_NAME,
--     CARDINALITY,
--     SUB_PART,
--     NULLABLE
-- FROM 
--     INFORMATION_SCHEMA.STATISTICS 
-- WHERE 
--     TABLE_SCHEMA = 'blog' 
--     AND TABLE_NAME IN ('article', 'comment', 'user', 'category', 'tag')
-- ORDER BY 
--     TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ========================================
-- 注意事项
-- ========================================
-- 1. 索引会占用额外的存储空间
-- 2. 索引会影响INSERT/UPDATE/DELETE的性能
-- 3. 建议在业务低峰期执行
-- 4. 执行后监控查询性能变化
-- 5. 定期分析和优化索引使用情况