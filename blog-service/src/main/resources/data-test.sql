-- ========================================
-- 测试环境初始化数据
-- 用于单元测试和集成测试
-- ========================================

-- 插入测试角色
INSERT INTO `role` (`id`, `name`, `description`) VALUES
(1, 'ADMIN', '管理员'),
(2, 'USER', '普通用户'),
(3, 'AUTHOR', '作者');

-- 插入测试用户
INSERT INTO `user` (`id`, `username`, `email`, `password`, `nickname`, `status`) VALUES
(1, 'admin', 'admin@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '管理员', 1),
(2, 'testuser', 'user@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', 1),
(3, 'author', 'author@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试作者', 1);

-- 插入用户角色关联
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES
(1, 1), -- admin -> ADMIN
(1, 3), -- admin -> AUTHOR
(2, 2), -- testuser -> USER
(3, 2), -- author -> USER
(3, 3); -- author -> AUTHOR

-- 插入测试分类
INSERT INTO `category` (`id`, `name`, `description`, `parent_id`, `sort_order`) VALUES
(1, '技术', '技术相关文章', 0, 1),
(2, 'Java', 'Java技术文章', 1, 1),
(3, 'Spring', 'Spring框架文章', 1, 2),
(4, '生活', '生活随笔', 0, 2),
(5, '旅行', '旅行记录', 4, 1);

-- 插入测试标签
INSERT INTO `tag` (`id`, `name`, `color`) VALUES
(1, 'Java', '#f56565'),
(2, 'Spring Boot', '#48bb78'),
(3, 'MySQL', '#4299e1'),
(4, '测试', '#9f7aea'),
(5, '教程', '#ed8936');

-- 插入测试文章
INSERT INTO `article` (`id`, `title`, `content`, `summary`, `author_id`, `category_id`, `status`, `view_count`, `like_count`, `comment_count`, `publish_time`) VALUES
(1, '测试文章1', '这是第一篇测试文章的内容...', '这是第一篇测试文章的摘要', 1, 2, 1, 100, 10, 2, NOW()),
(2, '测试文章2', '这是第二篇测试文章的内容...', '这是第二篇测试文章的摘要', 3, 3, 1, 50, 5, 1, NOW()),
(3, '草稿文章', '这是一篇草稿文章...', '草稿文章摘要', 3, 2, 0, 0, 0, 0, NULL);

-- 插入文章标签关联
INSERT INTO `article_tag` (`article_id`, `tag_id`) VALUES
(1, 1), -- 测试文章1 -> Java
(1, 4), -- 测试文章1 -> 测试
(2, 2), -- 测试文章2 -> Spring Boot
(2, 5), -- 测试文章2 -> 教程
(3, 1), -- 草稿文章 -> Java
(3, 4); -- 草稿文章 -> 测试

-- 插入测试评论
INSERT INTO `comment` (`id`, `article_id`, `user_id`, `parent_id`, `content`, `status`, `like_count`) VALUES
(1, 1, 2, 0, '这是第一条测试评论', 1, 3),
(2, 1, 3, 1, '这是对第一条评论的回复', 1, 1),
(3, 2, 2, 0, '这是第二篇文章的评论', 1, 2);

-- 插入测试相册
INSERT INTO `album` (`id`, `name`, `description`, `user_id`, `status`) VALUES
(1, '测试相册1', '第一个测试相册', 1, 1),
(2, '测试相册2', '第二个测试相册', 3, 1);