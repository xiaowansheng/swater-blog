-- ========================================
-- 测试环境数据库表结构
-- 使用H2数据库兼容MySQL语法
-- ========================================

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50),
  `avatar` VARCHAR(255),
  `status` TINYINT DEFAULT 1,
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE IF NOT EXISTS `role` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255),
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `user_role` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`)
);

-- 分类表
CREATE TABLE IF NOT EXISTS `category` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255),
  `parent_id` BIGINT DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE IF NOT EXISTS `article` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT,
  `summary` VARCHAR(500),
  `cover_image` VARCHAR(255),
  `author_id` BIGINT NOT NULL,
  `category_id` BIGINT,
  `status` TINYINT DEFAULT 1,
  `view_count` BIGINT DEFAULT 0,
  `like_count` BIGINT DEFAULT 0,
  `comment_count` BIGINT DEFAULT 0,
  `is_top` TINYINT DEFAULT 0,
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `publish_time` TIMESTAMP
);

-- 评论表
CREATE TABLE IF NOT EXISTS `comment` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `article_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `parent_id` BIGINT DEFAULT 0,
  `content` TEXT NOT NULL,
  `status` TINYINT DEFAULT 1,
  `like_count` BIGINT DEFAULT 0,
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 标签表
CREATE TABLE IF NOT EXISTS `tag` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `color` VARCHAR(20),
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS `article_tag` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `article_id` BIGINT NOT NULL,
  `tag_id` BIGINT NOT NULL,
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_article_tag` (`article_id`, `tag_id`)
);

-- 相册表
CREATE TABLE IF NOT EXISTS `album` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255),
  `cover_image` VARCHAR(255),
  `user_id` BIGINT NOT NULL,
  `status` TINYINT DEFAULT 1,
  `deleted` TINYINT DEFAULT 0,
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS `idx_user_username` ON `user` (`username`);
CREATE INDEX IF NOT EXISTS `idx_user_email` ON `user` (`email`);
CREATE INDEX IF NOT EXISTS `idx_article_author` ON `article` (`author_id`);
CREATE INDEX IF NOT EXISTS `idx_article_category` ON `article` (`category_id`);
CREATE INDEX IF NOT EXISTS `idx_article_status` ON `article` (`status`);
CREATE INDEX IF NOT EXISTS `idx_comment_article` ON `comment` (`article_id`);
CREATE INDEX IF NOT EXISTS `idx_comment_user` ON `comment` (`user_id`);