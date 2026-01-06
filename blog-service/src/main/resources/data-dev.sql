-- ========================================
-- 开发环境初始化数据
-- 包含完整的开发测试数据
-- ========================================

-- 1. 插入角色数据
INSERT INTO `role` (`id`, `name`, `code`, `role_key`, `description`, `status`) VALUES
(1, '超级管理员', 'SUPER_ADMIN', 'super_admin', '系统超级管理员，拥有所有权限', 1),
(2, '管理员', 'ADMIN', 'admin', '系统管理员，拥有大部分权限', 1),
(3, '编辑', 'EDITOR', 'editor', '内容编辑，可以管理文章和评论', 1),
(4, '作者', 'AUTHOR', 'author', '文章作者，可以发布和管理自己的文章', 1),
(5, '普通用户', 'USER', 'user', '普通注册用户', 1);

-- 2. 插入用户数据
-- 密码均为: 123456 (hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi)
INSERT INTO `user` (`id`, `username`, `email`, `password`, `nickname`, `avatar`, `role`, `status`, `disabled`, `ip_address_signup`, `ip_source_signup`) VALUES
(1, 'admin', 'admin@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '超级管理员', '/uploads/avatar/admin.jpg', 'admin', 1, 0, '127.0.0.1', '本地'),
(2, 'editor', 'editor@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '内容编辑', '/uploads/avatar/editor.jpg', 'editor', 1, 0, '127.0.0.1', '本地'),
(3, 'author1', 'author1@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '技术作者', '/uploads/avatar/author1.jpg', 'author', 1, 0, '127.0.0.1', '本地'),
(4, 'author2', 'author2@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '生活博主', '/uploads/avatar/author2.jpg', 'author', 1, 0, '127.0.0.1', '本地'),
(5, 'testuser', 'test@blog.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', '/uploads/avatar/test.jpg', 'user', 1, 0, '127.0.0.1', '本地');

-- 3. 插入分类数据
INSERT INTO `category` (`id`, `category_key`, `name`, `slug`, `description`, `parent_id`, `sort`, `status`) VALUES
(1, 'tech', '技术分享', 'tech', '技术相关的文章分享', 0, 1, '1'),
(2, 'java', 'Java技术', 'java', 'Java编程语言相关技术', 1, 1, '1'),
(3, 'spring', 'Spring框架', 'spring', 'Spring生态系统相关技术', 1, 2, '1'),
(4, 'frontend', '前端技术', 'frontend', '前端开发相关技术', 1, 3, '1'),
(5, 'database', '数据库', 'database', '数据库相关技术', 1, 4, '1'),
(6, 'life', '生活随笔', 'life', '生活感悟和随笔', 0, 2, '1'),
(7, 'travel', '旅行游记', 'travel', '旅行经历和游记', 6, 1, '1'),
(8, 'reading', '读书笔记', 'reading', '读书心得和笔记', 6, 2, '1'),
(9, 'photography', '摄影作品', 'photography', '摄影作品展示', 0, 3, '1');

-- 4. 插入标签数据
INSERT INTO `tag` (`id`, `tag_key`, `name`, `slug`, `description`, `color`, `status`) VALUES
(1, 'java', 'Java', 'java', 'Java编程语言', '#f56565', '1'),
(2, 'spring-boot', 'Spring Boot', 'spring-boot', 'Spring Boot框架', '#48bb78', '1'),
(3, 'spring-cloud', 'Spring Cloud', 'spring-cloud', 'Spring Cloud微服务', '#4299e1', '1'),
(4, 'mysql', 'MySQL', 'mysql', 'MySQL数据库', '#ed8936', '1'),
(5, 'redis', 'Redis', 'redis', 'Redis缓存', '#9f7aea', '1'),
(6, 'vuejs', 'Vue.js', 'vuejs', 'Vue.js前端框架', '#38b2ac', '1'),
(7, 'react', 'React', 'react', 'React前端框架', '#4299e1', '1'),
(8, 'docker', 'Docker', 'docker', 'Docker容器技术', '#2b6cb0', '1'),
(9, 'k8s', 'Kubernetes', 'k8s', 'Kubernetes容器编排', '#2d3748', '1'),
(10, 'microservice', '微服务', 'microservice', '微服务架构', '#805ad5', '1'),
(11, 'algorithm', '算法', 'algorithm', '算法和数据结构', '#d69e2e', '1'),
(12, 'design-pattern', '设计模式', 'design-pattern', '软件设计模式', '#38a169', '1'),
(13, 'performance', '性能优化', 'performance', '系统性能优化', '#e53e3e', '1'),
(14, 'security', '安全', 'security', '系统安全相关', '#dd6b20', '1'),
(15, 'tutorial', '教程', 'tutorial', '技术教程', '#3182ce', '1');

-- 5. 插入文章数据
INSERT INTO `article` (`id`, `article_key`, `title`, `slug`, `content`, `excerpt`, `cover`, `author_id`, `category_id`, `status`, `type`, `view_count`, `like_count`, `comment_count`, `is_top`, `published_at`) VALUES
(1, 'spring-boot-quickstart', 'Spring Boot 快速入门指南', 'spring-boot-quickstart', '# Spring Boot 快速入门指南\n\n本文将介绍如何快速上手Spring Boot开发...\n\n## 环境准备\n\n1. JDK 8+\n2. Maven 3.6+\n3. IDE（推荐IntelliJ IDEA）\n\n## 创建项目\n\n使用Spring Initializr创建项目...', 'Spring Boot是Spring家族的一个重要成员，它简化了Spring应用的创建和部署过程。本文将带你快速上手Spring Boot开发。', '/uploads/article/spring-boot-guide.jpg', 3, 3, 1, '1', 1250, 89, 15, 1, '2024-01-15 10:00:00'),
(2, 'mysql-performance-optimization', 'MySQL性能优化实战', 'mysql-performance-optimization', '# MySQL性能优化实战\n\n数据库性能优化是后端开发中的重要技能...\n\n## 索引优化\n\n合理使用索引是提升查询性能的关键...', '本文从索引优化、查询优化、配置优化等多个角度，详细介绍MySQL性能优化的实战技巧。', '/uploads/article/mysql-optimization.jpg', 3, 5, 1, '1', 980, 67, 12, 0, '2024-01-20 14:30:00'),
(3, 'vuejs-3-new-features', 'Vue.js 3.0 新特性详解', 'vuejs-3-new-features', '# Vue.js 3.0 新特性详解\n\nVue.js 3.0 带来了许多激动人心的新特性...\n\n## Composition API\n\nComposition API是Vue 3最重要的新特性之一...', 'Vue.js 3.0 正式发布，本文详细介绍了Composition API、Teleport、Fragments等重要新特性。', '/uploads/article/vue3-features.jpg', 4, 4, 1, '1', 756, 45, 8, 0, '2024-01-25 16:45:00');

-- 6. 插入文章标签关联
INSERT INTO `article_tag` (`article_id`, `tag_id`) VALUES
(1, 2), (1, 15),
(2, 4), (2, 13),
(3, 6), (3, 15);

-- 7. 插入系统配置（使用JSON聚合存储）
-- 网站信息配置（前台可见）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('site', '网站信息', '{
  "name": "Swater Blog",
  "description": "一个基于Spring Boot的个人博客系统",
  "keywords": "blog,spring boot,java,vue,技术博客",
  "logo": "",
  "favicon": "",
  "createTime": "2024-01-01",
  "icp": "",
  "police": "",
  "copyright": "© 2024 Swater Blog. All rights reserved.",
  "notice": ""
}', 'json', '网站基础信息配置', '网站设置', 1);

-- 作者信息配置（前台部分可见，qq/wechat/email等联系方式可选择性展示）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('author', '作者信息', '{
  "name": "Swater",
  "avatar": "",
  "signature": "热爱技术，热爱生活",
  "introduction": "一名热爱技术的全栈开发者，专注于Java和前端技术。",
  "email": "",
  "qq": "",
  "wechat": "",
  "github": "",
  "gitee": "",
  "weibo": "",
  "zhihu": "",
  "bilibili": "",
  "showEmail": false,
  "showQq": false,
  "showWechat": false
}', 'json', '作者/博主信息配置', '网站设置', 2);

-- 封面配置（前台可见）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('cover', '页面封面', '{
  "home": "",
  "article": "",
  "archive": "",
  "category": "",
  "tag": "",
  "talk": "",
  "album": "",
  "link": "",
  "about": "",
  "message": "",
  "default": ""
}', 'json', '各页面顶部封面图配置', '网站设置', 3);

-- 社交链接配置（前台可见）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('social', '社交链接', '{
  "github": "",
  "gitee": "",
  "weibo": "",
  "zhihu": "",
  "bilibili": "",
  "twitter": "",
  "facebook": ""
}', 'json', '社交媒体链接配置', '网站设置', 4);

-- 隐私配置（前台需要读取来决定显示什么）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('privacy', '隐私设置', '{
  "showIp": false,
  "showLocation": true,
  "showDevice": false,
  "showBrowser": false
}', 'json', '前台隐私信息显示配置', '功能设置', 1);

-- 评论设置（前台需要读取部分配置）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('comment', '评论设置', '{
  "enableAudit": true,
  "allowAnonymous": false,
  "allowGuest": true,
  "showEmail": false
}', 'json', '评论功能配置', '功能设置', 2);

-- 通知配置（仅后台使用，前台不可见）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('notify', '通知设置', '{
  "loginNotify": false,
  "commentNotify": true,
  "replyNotify": true,
  "guestbookNotify": true,
  "friendLinkNotify": true
}', 'json', '系统通知配置', '功能设置', 3);

-- 上传设置（仅后台使用）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('upload', '上传设置', '{
  "maxSize": 10485760,
  "allowedTypes": "jpg,jpeg,png,gif,webp,pdf,doc,docx,zip",
  "imageCompress": true,
  "imageQuality": 85
}', 'json', '文件上传配置', '功能设置', 4);

-- 邮件配置（仅后台使用，包含敏感信息）
INSERT INTO `sys_config` (`config_key`, `name`, `value`, `type`, `description`, `group_name`, `sort`) VALUES
('email', '邮件设置', '{
  "enable": false,
  "host": "smtp.qq.com",
  "port": 465,
  "username": "",
  "password": "",
  "fromName": "Swater Blog"
}', 'json', 'SMTP邮件服务配置', '功能设置', 5);

-- 8. 插入友链数据
INSERT INTO `friend_link` (`id`, `name`, `url`, `logo`, `description`, `status`, `sort`) VALUES
(1, 'Spring官网', 'https://spring.io', '/uploads/links/spring-logo.png', 'Spring框架官方网站', 1, 1),
(2, 'Vue.js官网', 'https://vuejs.org', '/uploads/links/vue-logo.png', 'Vue.js官方网站', 1, 2),
(3, 'GitHub', 'https://github.com', '/uploads/links/github-logo.png', '全球最大的代码托管平台', 1, 3);
