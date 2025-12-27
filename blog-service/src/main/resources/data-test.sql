-- ========================================
-- 测试环境初始化数据
-- 仅包含基础测试数据
-- ========================================

-- 1. 插入角色数据
INSERT INTO `role` (`id`, `name`, `code`, `role_key`, `description`, `status`) VALUES
(1, '超级管理员', 'SUPER_ADMIN', 'super_admin', '系统超级管理员', 1),
(2, '管理员', 'ADMIN', 'admin', '系统管理员', 1),
(3, '用户', 'USER', 'user', '普通用户', 1);

-- 2. 插入用户数据
-- 密码均为: 123456 (hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi)
INSERT INTO `user` (`id`, `username`, `email`, `password`, `nickname`, `role`, `status`) VALUES
(1, 'admin', 'admin@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试管理员', 'admin', 1),
(2, 'testuser', 'user@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', 'user', 1);

-- 3. 插入基础配置
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`) VALUES
('site.name', '测试站点', 'Test Blog', 'string'),
('comment.audit', '评论审核', 'false', 'boolean');
