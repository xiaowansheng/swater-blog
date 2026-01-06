-- ========================================
-- 测试环境初始化数据
-- 仅包含基础测试数据
-- ========================================

-- 1. 插入角色数据
INSERT INTO `role` (`id`, `name`, `role_key`, `description`, `status`) VALUES
(1, '超级管理员', 'super_admin', '系统超级管理员', 1),
(2, '管理员', 'admin', '系统管理员', 1),
(3, '用户', 'user', '普通用户', 1);

-- 2. 插入用户数据
-- 密码均为: 123456 (hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi)
INSERT INTO `user` (`id`, `username`, `email`, `password`, `nickname`, `role_key`, `status`) VALUES
(1, 'admin', 'admin@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试管理员', 'admin', 1),
(2, 'testuser', 'user@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', 'user', 1);

-- 3. 插入基础配置（使用JSON聚合存储）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('site', '网站信息', '{"name":"Test Blog","description":"测试博客","keywords":"test,blog","logo":"","favicon":"","createTime":"2024-01-01","icp":"","police":"","copyright":"© 2024 Test Blog","notice":""}', 'json', '网站基础信息', '网站设置', 1),
('author', '作者信息', '{"name":"Tester","avatar":"","signature":"测试签名","introduction":"测试简介","email":"","qq":"","wechat":"","github":"","gitee":"","weibo":"","zhihu":"","bilibili":"","showEmail":false,"showQq":false,"showWechat":false}', 'json', '作者信息', '网站设置', 2),
('cover', '页面封面', '{"home":"","article":"","archive":"","category":"","tag":"","talk":"","album":"","link":"","about":"","message":"","default":""}', 'json', '封面配置', '网站设置', 3),
('social', '社交链接', '{"github":"","gitee":"","weibo":"","zhihu":"","bilibili":"","twitter":"","facebook":""}', 'json', '社交链接', '网站设置', 4),
('privacy', '隐私设置', '{"showIp":false,"showLocation":true,"showDevice":false,"showBrowser":false}', 'json', '隐私设置', '功能设置', 1),
('comment', '评论设置', '{"enableAudit":false,"allowAnonymous":true,"allowGuest":true,"showEmail":false}', 'json', '评论设置', '功能设置', 2),
('notify', '通知设置', '{"loginNotify":false,"commentNotify":false,"replyNotify":false,"guestbookNotify":false,"friendLinkNotify":false}', 'json', '通知设置', '功能设置', 3),
('upload', '上传设置', '{"maxSize":10485760,"allowedTypes":"jpg,jpeg,png,gif,webp","imageCompress":true,"imageQuality":85}', 'json', '上传设置', '功能设置', 4),
('email', '邮件设置', '{"enable":false,"host":"smtp.qq.com","port":465,"username":"","password":"","fromName":"Test Blog"}', 'json', '邮件设置', '功能设置', 5);
