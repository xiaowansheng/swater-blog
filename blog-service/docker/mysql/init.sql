-- ========================================
-- MySQL初始化脚本
-- 创建初始数据和配置
-- ========================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建默认管理员用户
INSERT INTO `user` (
    `username`, `email`, `password`, `nickname`, `avatar`,
    `role_key`, `status`, `disabled`, `create_time`, `update_time`
) VALUES (
    'admin',
    'admin@blog.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', -- 密码: 123456
    '管理员',
    '/uploads/avatar/default-admin.jpg',
    'admin',
    1,
    0,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- 创建默认角色
INSERT INTO `role` (
    `name`, `role_key`, `description`,
    `status`, `disabled`, `create_time`, `update_time`
) VALUES
    ('管理员', 'admin', '系统管理员，拥有所有权限', 1, 0, NOW(), NOW()),
    ('编辑', 'editor', '内容编辑，可以管理文章和评论', 1, 0, NOW(), NOW()),
    ('用户', 'user', '普通用户，可以评论和互动', 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- 创建默认分类
INSERT INTO `category` (
    `category_key`, `name`, `slug`, `description`, 
    `parent_id`, `sort`, `status`, `create_time`, `update_time`
) VALUES 
    ('tech', '技术分享', 'technology', '技术相关的文章分享', 0, 1, '1', NOW(), NOW()),
    ('life', '生活随笔', 'life', '生活感悟和随笔', 0, 2, '1', NOW(), NOW()),
    ('tutorial', '教程指南', 'tutorial', '各种教程和指南', 0, 3, '1', NOW(), NOW()),
    ('news', '资讯动态', 'news', '行业资讯和动态', 0, 4, '1', NOW(), NOW())
ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- 创建默认标签
INSERT INTO `tag` (
    `tag_key`, `name`, `slug`, `color`, `description`, 
    `status`, `create_time`, `update_time`
) VALUES 
    ('java', 'Java', 'java', '#f89406', 'Java编程语言', '1', NOW(), NOW()),
    ('spring', 'Spring', 'spring', '#5cb85c', 'Spring框架', '1', NOW(), NOW()),
    ('docker', 'Docker', 'docker', '#5bc0de', '容器化技术', '1', NOW(), NOW()),
    ('mysql', 'MySQL', 'mysql', '#d9534f', 'MySQL数据库', '1', NOW(), NOW()),
    ('redis', 'Redis', 'redis', '#d43f3a', 'Redis缓存', '1', NOW(), NOW())
ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- 创建系统配置
INSERT INTO `sys_config` (
    `config_key`, `name`, `value`, `type`, `description`, 
    `group_name`, `sort`, `create_time`, `update_time`
) VALUES 
    ('site.name', '网站名称', 'My Blog', 'string', '网站名称', '基础设置', 1, NOW(), NOW()),
    ('site.description', '网站描述', '一个基于Spring Boot的个人博客系统', 'string', '网站描述', '基础设置', 2, NOW(), NOW()),
    ('site.keywords', '网站关键词', 'blog,spring boot,java', 'string', '网站关键词', '基础设置', 3, NOW(), NOW()),
    ('site.author', '网站作者', 'Blog Admin', 'string', '网站作者', '基础设置', 4, NOW(), NOW()),
    ('site.icp', 'ICP备案号', '', 'string', 'ICP备案号', '基础设置', 5, NOW(), NOW()),
    ('comment.audit', '评论审核', 'true', 'boolean', '是否开启评论审核', '评论设置', 1, NOW(), NOW()),
    ('comment.anonymous', '匿名评论', 'true', 'boolean', '是否允许匿名评论', '评论设置', 2, NOW(), NOW()),
    ('upload.max_size', '上传文件大小限制', '10485760', 'int', '上传文件大小限制(字节)', '上传设置', 1, NOW(), NOW()),
    ('upload.allowed_types', '允许上传的文件类型', 'jpg,jpeg,png,gif,pdf,doc,docx', 'string', '允许上传的文件类型', '上传设置', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- 创建示例文章
INSERT INTO `article` (
    `article_key`, `title`, `slug`, `content`, `excerpt`, `cover`,
    `author_id`, `category_id`, `type`, `status`, `is_top`,
    `view_count`, `like_count`, `comment_count`, `published_at`,
    `create_time`, `update_time`
) 
SELECT 
    'welcome-to-blog',
    '欢迎使用Blog系统',
    'welcome-to-blog',
    '# 欢迎使用Blog系统

这是一个基于Spring Boot开发的现代化博客系统，具有以下特性：

## 🚀 核心功能
- 文章管理：支持Markdown编辑，分类标签
- 评论系统：支持嵌套评论，实时通知
- 用户管理：角色权限，个人资料
- 文件管理：图片上传，文件存储

## 🔒 安全特性
- 多维度限流保护
- SQL注入防护
- XSS攻击防护
- 数据脱敏处理

## 📈 性能优化
- Redis多级缓存
- 数据库索引优化
- 异步事件处理
- 性能监控告警

## 🛠️ 技术栈
- **后端**: Spring Boot 3.x + Java 21
- **数据库**: MySQL 8.0 + Redis 7.0
- **搜索**: Elasticsearch 8.x
- **消息队列**: RabbitMQ 3.x
- **容器化**: Docker + Docker Compose

开始你的博客之旅吧！',
    '欢迎使用这个功能完整的博客系统，支持现代化的功能和安全特性。',
    '/uploads/cover/welcome.jpg',
    (SELECT id FROM `user` WHERE username = 'admin' LIMIT 1),
    (SELECT id FROM `category` WHERE category_key = 'tech' LIMIT 1),
    '1',
    '1',
    1,
    0,
    0,
    0,
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM `article` WHERE article_key = 'welcome-to-blog');

-- 重置外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 输出初始化完成信息
SELECT '数据库初始化完成！' as message;
SELECT CONCAT('管理员账号: admin, 密码: 123456') as admin_info;