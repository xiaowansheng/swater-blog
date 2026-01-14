-- ========================================
-- 开发环境初始化数据
-- 仅包含基础测试数据：管理员和测试用户
-- 使用 INSERT IGNORE 避免重复插入错误
-- ========================================

-- 1. 插入角色数据（仅保留管理员和普通用户角色）
INSERT IGNORE INTO `role` (`id`, `name`, `role_key`, `description`, `status`) VALUES
(1, '管理员', 'admin', '系统管理员，拥有所有权限', 1),
(2, '测试', 'test', '普通注册用户', 1);

-- 2. 插入用户数据test
-- 密码均为: 123456 (hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi)
INSERT IGNORE INTO `user` (`id`, `username`, `email`, `password`, `nickname`, `avatar`, `role_key`, `status`, `disabled`, `ip_address_signup`, `ip_source_signup`) VALUES
(1, 'admin', 'xiaowansheng@foxmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '管理员', '/uploads/avatar/admin.jpg', 'admin', 1, 0, '127.0.0.1', '本地'),
(2, 'test', 'test@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', '/uploads/avatar/test.jpg', 'test', 1, 0, '127.0.0.1', '本地');
