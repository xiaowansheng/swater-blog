-- ========================================
-- 开发环境初始化数据
-- 包含完整的开发测试数据
-- ========================================

-- 插入角色数据
INSERT INTO `t_role` (`id`, `name`, `role_key`, `description`) VALUES
(1, '超级管理员', 'super_admin', '系统超级管理员，拥有所有权限'),
(2, '管理员', 'admin', '系统管理员，拥有大部分权限'),
(3, '编辑', 'editor', '内容编辑，可以管理文章和评论'),
(4, '作者', 'author', '文章作者，可以发布和管理自己的文章'),
(5, '普通用户', 'user', '普通注册用户');

-- 插入用户数据
INSERT INTO `t_user` (`id`, `username`, `email`, `password`, `nickname`, `disabled`, `ip_address_signup`, `ip_source_signup`) VALUES
(1, 'admin', 'admin@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '超级管理员', 0, '127.0.0.1', '本地'),
(2, 'editor', 'editor@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '编辑', 0, '127.0.0.1', '本地'),
(3, 'author', 'author@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '作者', 0, '127.0.0.1', '本地'),
(4, 'user', 'user@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '普通用户', 0, '127.0.0.1', '本地');

-- 插入用户角色关联
INSERT INTO `t_user_role` (`user_id`, `role_id`) VALUES
(1, 1), -- admin -> 超级管理员
(2, 3), -- editor -> 编辑
(3, 4), -- author -> 作者
(4, 5); -- user -> 普通用户

-- 插入分类数据
INSERT INTO `t_category` (`id`, `category_key`, `name`, `description`, `status`) VALUES
(1, 'tech', '技术分享', '技术相关的文章分享', '1'),
(2, 'java', 'Java', 'Java编程语言相关', '1'),
(3, 'spring', 'Spring', 'Spring框架相关', '1'),
(4, 'database', '数据库', '数据库技术相关', '1'),
(5, 'frontend', '前端技术', '前端开发技术', '1'),
(6, 'life', '生活随笔', '生活感悟和随笔', '1'),
(7, 'tutorial', '教程指南', '各种教程和指南', '1'),
(8, 'news', '资讯动态', '行业资讯和动态', '1');

-- 插入标签数据
INSERT INTO `t_tag` (`id`, `tag_key`, `name`, `status`) VALUES
(1, 'java', 'Java', '1'),
(2, 'spring-boot', 'Spring Boot', '1'),
(3, 'mysql', 'MySQL', '1'),
(4, 'redis', 'Redis', '1'),
(5, 'docker', 'Docker', '1'),
(6, 'vue', 'Vue.js', '1'),
(7, 'react', 'React', '1'),
(8, 'javascript', 'JavaScript', '1'),
(9, 'typescript', 'TypeScript', '1'),
(10, 'tutorial', '教程', '1');

-- 插入系统配置
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `description`) VALUES
('site.name', '网站名称', 'Swater Blog', '网站名称'),
('site.description', '网站描述', '一个基于Spring Boot的个人博客系统', '网站描述'),
('site.keywords', '网站关键词', 'blog,spring boot,java,vue', '网站关键词'),
('site.author', '网站作者', 'Swater', '网站作者'),
('site.icp', 'ICP备案号', '', 'ICP备案号'),
('comment.audit', '评论审核', 'true', '是否开启评论审核'),
('comment.anonymous', '匿名评论', 'true', '是否允许匿名评论'),
('upload.max_size', '上传文件大小限制', '10485760', '上传文件大小限制(字节)'),
('upload.allowed_types', '允许上传的文件类型', 'jpg,jpeg,png,gif,pdf,doc,docx', '允许上传的文件类型');

-- 插入示例文章
INSERT INTO `t_article` (`id`, `article_key`, `title`, `content`, `user_id`, `category_id`, `type`, `status`) VALUES
(1, 'welcome-to-blog', '欢迎使用Swater Blog', '# 欢迎使用Swater Blog\n\n这是一个基于Spring Boot开发的现代化博客系统。\n\n## 主要特性\n\n- 用户管理和权限控制\n- 文章发布和管理\n- 评论系统\n- 文件上传\n- 响应式设计\n\n开始你的博客之旅吧！', 1, 1, '1', '1'),
(2, 'spring-boot-tutorial', 'Spring Boot 入门教程', '# Spring Boot 入门教程\n\nSpring Boot是一个基于Spring框架的快速开发框架...\n\n## 什么是Spring Boot\n\nSpring Boot简化了Spring应用的创建和部署过程。', 3, 3, '1', '1'),
(3, 'mysql-optimization', 'MySQL性能优化指南', '# MySQL性能优化指南\n\n本文将介绍MySQL数据库的性能优化技巧...\n\n## 索引优化\n\n合理使用索引是提升查询性能的关键。', 3, 4, '1', '1');

-- 插入文章标签关联
INSERT INTO `t_article_tag` (`article_id`, `tag_id`) VALUES
(1, 2), -- 欢迎文章 -> Spring Boot
(2, 1), -- Spring Boot教程 -> Java
(2, 2), -- Spring Boot教程 -> Spring Boot
(2, 10), -- Spring Boot教程 -> 教程
(3, 3), -- MySQL优化 -> MySQL
(3, 10); -- MySQL优化 -> 教程
(1, 10), (1, 11), (1, 12), (1, 13), (1, 14),
(1, 20), (1, 21), (1, 22),
(1, 100), (1, 101), (1, 102), (1, 103),
(1, 110), (1, 111), (1, 112), (1, 113), (1, 114),

-- 管理员权限
(2, 1), (2, 2), (2, 3), (2, 5),
(2, 10), (2, 11), (2, 12), (2, 13), (2, 14),
(2, 20), (2, 21), (2, 22),
(2, 100), (2, 101), (2, 103),
(2, 110), (2, 111), (2, 112), (2, 113), (2, 114),

-- 编辑权限
(3, 10), (3, 11), (3, 12), (3, 13), (3, 14),
(3, 110), (3, 111), (3, 113), (3, 114),

-- 作者权限
(4, 10), (4, 11),
(4, 110), (4, 111), (4, 113), (4, 114);

-- 插入用户数据
INSERT INTO `user` (`id`, `username`, `email`, `password`, `nickname`, `avatar`, `phone`, `gender`, `bio`, `status`) VALUES
(1, 'admin', 'admin@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '超级管理员', '/uploads/avatar/admin.jpg', '13800138000', 1, '系统超级管理员账号', 1),
(2, 'editor', 'editor@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '内容编辑', '/uploads/avatar/editor.jpg', '13800138001', 2, '负责内容审核和编辑工作', 1),
(3, 'author1', 'author1@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '技术作者', '/uploads/avatar/author1.jpg', '13800138002', 1, '专注于技术文章写作', 1),
(4, 'author2', 'author2@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '生活博主', '/uploads/avatar/author2.jpg', '13800138003', 2, '分享生活点滴和感悟', 1),
(5, 'testuser', 'test@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', '/uploads/avatar/test.jpg', '13800138004', 0, '用于测试的普通用户账号', 1);

-- 插入用户角色关联
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES
(1, 1), -- admin -> 超级管理员
(2, 3), -- editor -> 编辑
(3, 4), -- author1 -> 作者
(4, 4), -- author2 -> 作者
(5, 5); -- testuser -> 普通用户

-- 插入分类数据
INSERT INTO `category` (`id`, `name`, `slug`, `description`, `cover_image`, `parent_id`, `sort_order`, `article_count`) VALUES
(1, '技术分享', 'tech', '技术相关的文章分享', '/uploads/category/tech.jpg', 0, 1, 0),
(2, 'Java技术', 'java', 'Java编程语言相关技术', '/uploads/category/java.jpg', 1, 1, 0),
(3, 'Spring框架', 'spring', 'Spring生态系统相关技术', '/uploads/category/spring.jpg', 1, 2, 0),
(4, '前端技术', 'frontend', '前端开发相关技术', '/uploads/category/frontend.jpg', 1, 3, 0),
(5, '数据库', 'database', '数据库相关技术', '/uploads/category/database.jpg', 1, 4, 0),
(6, '生活随笔', 'life', '生活感悟和随笔', '/uploads/category/life.jpg', 0, 2, 0),
(7, '旅行游记', 'travel', '旅行经历和游记', '/uploads/category/travel.jpg', 6, 1, 0),
(8, '读书笔记', 'reading', '读书心得和笔记', '/uploads/category/reading.jpg', 6, 2, 0),
(9, '摄影作品', 'photography', '摄影作品展示', '/uploads/category/photography.jpg', 0, 3, 0);

-- 插入标签数据
INSERT INTO `tag` (`id`, `name`, `slug`, `description`, `color`, `article_count`) VALUES
(1, 'Java', 'java', 'Java编程语言', '#f56565', 0),
(2, 'Spring Boot', 'spring-boot', 'Spring Boot框架', '#48bb78', 0),
(3, 'Spring Cloud', 'spring-cloud', 'Spring Cloud微服务', '#4299e1', 0),
(4, 'MySQL', 'mysql', 'MySQL数据库', '#ed8936', 0),
(5, 'Redis', 'redis', 'Redis缓存', '#9f7aea', 0),
(6, 'Vue.js', 'vuejs', 'Vue.js前端框架', '#38b2ac', 0),
(7, 'React', 'react', 'React前端框架', '#4299e1', 0),
(8, 'Docker', 'docker', 'Docker容器技术', '#2b6cb0', 0),
(9, 'Kubernetes', 'k8s', 'Kubernetes容器编排', '#2d3748', 0),
(10, '微服务', 'microservice', '微服务架构', '#805ad5', 0),
(11, '算法', 'algorithm', '算法和数据结构', '#d69e2e', 0),
(12, '设计模式', 'design-pattern', '软件设计模式', '#38a169', 0),
(13, '性能优化', 'performance', '系统性能优化', '#e53e3e', 0),
(14, '安全', 'security', '系统安全相关', '#dd6b20', 0),
(15, '教程', 'tutorial', '技术教程', '#3182ce', 0);

-- 插入文章数据
INSERT INTO `article` (`id`, `title`, `slug`, `content`, `summary`, `cover_image`, `author_id`, `category_id`, `status`, `type`, `view_count`, `like_count`, `comment_count`, `is_top`, `is_recommend`, `publish_time`) VALUES
(1, 'Spring Boot 快速入门指南', 'spring-boot-quickstart', '# Spring Boot 快速入门指南\n\n本文将介绍如何快速上手Spring Boot开发...\n\n## 环境准备\n\n1. JDK 8+\n2. Maven 3.6+\n3. IDE（推荐IntelliJ IDEA）\n\n## 创建项目\n\n使用Spring Initializr创建项目...', 'Spring Boot是Spring家族的一个重要成员，它简化了Spring应用的创建和部署过程。本文将带你快速上手Spring Boot开发。', '/uploads/article/spring-boot-guide.jpg', 3, 3, 1, 1, 1250, 89, 15, 1, 1, '2024-01-15 10:00:00'),

(2, 'MySQL性能优化实战', 'mysql-performance-optimization', '# MySQL性能优化实战\n\n数据库性能优化是后端开发中的重要技能...\n\n## 索引优化\n\n合理使用索引是提升查询性能的关键...', '本文从索引优化、查询优化、配置优化等多个角度，详细介绍MySQL性能优化的实战技巧。', '/uploads/article/mysql-optimization.jpg', 3, 5, 1, 1, 980, 67, 12, 0, 1, '2024-01-20 14:30:00'),

(3, 'Vue.js 3.0 新特性详解', 'vuejs-3-new-features', '# Vue.js 3.0 新特性详解\n\nVue.js 3.0 带来了许多激动人心的新特性...\n\n## Composition API\n\nComposition API是Vue 3最重要的新特性之一...', 'Vue.js 3.0 正式发布，本文详细介绍了Composition API、Teleport、Fragments等重要新特性。', '/uploads/article/vue3-features.jpg', 4, 4, 1, 1, 756, 45, 8, 0, 1, '2024-01-25 16:45:00'),

(4, '我的西藏之旅', 'tibet-travel', '# 我的西藏之旅\n\n这是一次说走就走的旅行...\n\n## 拉萨印象\n\n布达拉宫的雄伟让人震撼...', '记录了一次难忘的西藏之旅，从拉萨到纳木错，感受高原的神秘与美丽。', '/uploads/article/tibet-travel.jpg', 4, 7, 1, 1, 432, 28, 5, 0, 0, '2024-02-01 09:15:00'),

(5, 'Docker容器化部署实践', 'docker-deployment', '# Docker容器化部署实践\n\n容器化技术已经成为现代应用部署的标准...\n\n## Docker基础\n\n首先了解Docker的基本概念...', '详细介绍了使用Docker进行应用容器化部署的完整流程，包括镜像构建、容器编排等。', '/uploads/article/docker-deployment.jpg', 3, 2, 1, 1, 623, 41, 7, 0, 1, '2024-02-05 11:20:00'),

(6, '《代码整洁之道》读书笔记', 'clean-code-notes', '# 《代码整洁之道》读书笔记\n\n这本书是每个程序员都应该读的经典...\n\n## 有意义的命名\n\n好的命名是整洁代码的基础...', '分享《代码整洁之道》这本经典技术书籍的读书心得，总结了编写整洁代码的核心原则。', '/uploads/article/clean-code.jpg', 3, 8, 1, 1, 345, 23, 4, 0, 0, '2024-02-10 20:30:00'),

(7, 'Redis缓存设计模式', 'redis-cache-patterns', '# Redis缓存设计模式\n\n缓存是提升系统性能的重要手段...\n\n## 缓存穿透\n\n当查询不存在的数据时...', '深入探讨Redis在实际项目中的应用，介绍常见的缓存设计模式和最佳实践。', '/uploads/article/redis-patterns.jpg', 3, 5, 1, 1, 789, 56, 9, 0, 1, '2024-02-15 13:45:00'),

(8, '春天的故事', 'spring-story', '# 春天的故事\n\n春天来了，万物复苏...\n\n## 樱花盛开\n\n公园里的樱花开得正艳...', '记录春天的美好时光，感受大自然的生机与活力。', '/uploads/article/spring-story.jpg', 4, 6, 1, 1, 234, 18, 3, 0, 0, '2024-03-01 08:00:00');

-- 插入文章标签关联
INSERT INTO `article_tag` (`article_id`, `tag_id`) VALUES
(1, 2), (1, 15), -- Spring Boot 快速入门指南
(2, 4), (2, 13), -- MySQL性能优化实战
(3, 6), (3, 15), -- Vue.js 3.0 新特性详解
(4, 1), (4, 2), (4, 4), (4, 5), -- Docker容器化部署实践
(5, 8), (5, 15), -- Docker容器化部署实践
(6, 12), (6, 15), -- 《代码整洁之道》读书笔记
(7, 5), (7, 13), (7, 12); -- Redis缓存设计模式

-- 插入评论数据
INSERT INTO `comment` (`id`, `article_id`, `user_id`, `parent_id`, `content`, `author_ip`, `status`, `like_count`) VALUES
(1, 1, 5, 0, '这篇Spring Boot教程写得很详细，对新手很友好！', '192.168.1.100', 1, 5),
(2, 1, 2, 1, '确实，我也是通过这个教程入门的Spring Boot', '192.168.1.101', 1, 2),
(3, 1, 4, 0, '期待更多Spring Boot进阶内容', '192.168.1.102', 1, 3),
(4, 2, 5, 0, 'MySQL优化这块确实很重要，收藏了', '192.168.1.103', 1, 4),
(5, 2, 3, 4, '谢谢支持，后续会分享更多数据库优化技巧', '192.168.1.104', 1, 1),
(6, 3, 2, 0, 'Vue 3的Composition API确实很强大', '192.168.1.105', 1, 6),
(7, 4, 3, 0, '西藏真的很美，有机会也想去看看', '192.168.1.106', 1, 2),
(8, 5, 5, 0, 'Docker现在确实是必备技能了', '192.168.1.107', 1, 3);

-- 插入相册数据
INSERT INTO `album` (`id`, `name`, `description`, `cover_image`, `user_id`, `status`, `photo_count`) VALUES
(1, '技术分享图片', '用于技术文章的配图', '/uploads/album/tech-cover.jpg', 3, 1, 0),
(2, '旅行摄影', '旅行途中的美景记录', '/uploads/album/travel-cover.jpg', 4, 1, 0),
(3, '生活随拍', '日常生活的点点滴滴', '/uploads/album/life-cover.jpg', 4, 1, 0),
(4, '风景摄影', '自然风光摄影作品', '/uploads/album/landscape-cover.jpg', 1, 1, 0);

-- 插入友链数据
INSERT INTO `friend_link` (`id`, `name`, `url`, `logo`, `description`, `email`, `status`, `sort_order`) VALUES
(1, 'Spring官网', 'https://spring.io', '/uploads/links/spring-logo.png', 'Spring框架官方网站', 'contact@spring.io', 1, 1),
(2, 'Vue.js官网', 'https://vuejs.org', '/uploads/links/vue-logo.png', 'Vue.js官方网站', 'contact@vuejs.org', 1, 2),
(3, 'GitHub', 'https://github.com', '/uploads/links/github-logo.png', '全球最大的代码托管平台', 'support@github.com', 1, 3),
(4, 'Stack Overflow', 'https://stackoverflow.com', '/uploads/links/so-logo.png', '程序员问答社区', 'team@stackoverflow.com', 1, 4),
(5, '掘金', 'https://juejin.cn', '/uploads/links/juejin-logo.png', '技术社区', 'contact@juejin.cn', 1, 5);

-- 插入系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `description`) VALUES
('site.name', 'Swater Blog', 'string', '网站名称'),
('site.description', '一个基于Spring Boot的个人博客系统', 'string', '网站描述'),
('site.keywords', 'Spring Boot,博客,技术分享', 'string', '网站关键词'),
('site.author', 'Swater', 'string', '网站作者'),
('site.email', 'admin@blog.com', 'string', '联系邮箱'),
('site.icp', '京ICP备12345678号', 'string', 'ICP备案号'),
('comment.need_review', 'false', 'boolean', '评论是否需要审核'),
('comment.allow_guest', 'true', 'boolean', '是否允许游客评论'),
('upload.max_size', '10485760', 'number', '文件上传最大大小（字节）'),
('upload.allowed_types', 'jpg,jpeg,png,gif,pdf,doc,docx', 'string', '允许上传的文件类型');

-- 更新文章数量统计
UPDATE `category` SET `article_count` = (
    SELECT COUNT(*) FROM `article` WHERE `category_id` = `category`.`id` AND `status` = 1 AND `deleted` = 0
);

UPDATE `tag` SET `article_count` = (
    SELECT COUNT(*) FROM `article_tag` at 
    INNER JOIN `article` a ON at.`article_id` = a.`id` 
    WHERE at.`tag_id` = `tag`.`id` AND a.`status` = 1 AND a.`deleted` = 0 AND at.`deleted` = 0
);

-- 更新相册照片数量（暂时为0，等照片数据插入后更新）
UPDATE `album` SET `photo_count` = 0;