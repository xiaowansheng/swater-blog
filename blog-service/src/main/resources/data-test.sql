-- ========================================
-- 测试环境初始化数据
-- 用于单元测试和集成测试
-- ========================================

-- 插入测试角色
INSERT INTO `t_role` (`id`, `name`, `role_key`, `description`) VALUES
(1, 'ADMIN', 'admin', '管理员'),
(2, 'USER', 'user', '普通用户'),
(3, 'AUTHOR', 'author', '作者');

-- 插入测试用户
INSERT INTO `t_user` (`id`, `username`, `email`, `password`, `nickname`, `role`, `disabled`, `ip_address_signup`, `ip_source_signup`) VALUES
(1, 'admin', 'admin@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '管理员', 'admin', 0, '127.0.0.1', '本地'),
(2, 'testuser', 'user@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', 'user', 0, '127.0.0.1', '本地'),
(3, 'author', 'author@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试作者', 'author', 0, '127.0.0.1', '本地');

-- 插入测试分类
INSERT INTO `t_category` (`id`, `category_key`, `name`, `description`, `status`) VALUES
(1, 'tech', '技术', '技术相关文章', '1'),
(2, 'java', 'Java', 'Java技术文章', '1'),
(3, 'spring', 'Spring', 'Spring框架文章', '1'),
(4, 'life', '生活', '生活随笔', '1'),
(5, 'travel', '旅行', '旅行记录', '1');

-- 插入测试标签
INSERT INTO `t_tag` (`id`, `tag_key`, `name`, `status`) VALUES
(1, 'java', 'Java', '1'),
(2, 'spring-boot', 'Spring Boot', '1'),
(3, 'mysql', 'MySQL', '1'),
(4, 'test', '测试', '1'),
(5, 'tutorial', '教程', '1');

-- 插入测试文章
INSERT INTO `t_article` (`id`, `article_key`, `title`, `content`, `user_id`, `category_id`, `type`, `status`) VALUES
(1, 'test-article-1', '测试文章1', '这是第一篇测试文章的内容...', 1, 2, '1', '1'),
(2, 'test-article-2', '测试文章2', '这是第二篇测试文章的内容...', 3, 3, '1', '1'),
(3, 'draft-article', '草稿文章', '这是一篇草稿文章...', 3, 2, '1', '2');

-- 插入文章标签关联
INSERT INTO `t_article_tag` (`article_id`, `tag_id`) VALUES
(1, 1), -- 测试文章1 -> Java
(1, 2), -- 测试文章1 -> Spring Boot
(2, 2), -- 测试文章2 -> Spring Boot
(2, 3); -- 测试文章2 -> MySQL
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