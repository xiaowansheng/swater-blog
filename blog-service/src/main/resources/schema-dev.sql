-- ========================================
-- 开发环境数据库表结构
-- MySQL 8.0+ 语法
-- ========================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `blog_dev` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `blog_dev`;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `gender` TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
  `birthday` DATE COMMENT '生日',
  `bio` TEXT COMMENT '个人简介',
  `website` VARCHAR(255) COMMENT '个人网站',
  `location` VARCHAR(100) COMMENT '所在地',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `last_login_time` TIMESTAMP NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS `role` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
  `description` VARCHAR(255) COMMENT '角色描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS `permission` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
  `name` VARCHAR(50) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
  `type` TINYINT NOT NULL COMMENT '权限类型：1-菜单，2-按钮，3-接口',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID',
  `path` VARCHAR(255) COMMENT '路径',
  `icon` VARCHAR(50) COMMENT '图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_code` (`code`),
  INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `user_role` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS `role_permission` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `permission_id` BIGINT NOT NULL COMMENT '权限ID',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 分类表
CREATE TABLE IF NOT EXISTS `category` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(100) COMMENT '分类别名',
  `description` VARCHAR(255) COMMENT '分类描述',
  `cover_image` VARCHAR(255) COMMENT '封面图片',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `article_count` BIGINT DEFAULT 0 COMMENT '文章数量',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 文章表
CREATE TABLE IF NOT EXISTS `article` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '文章ID',
  `title` VARCHAR(255) NOT NULL COMMENT '文章标题',
  `slug` VARCHAR(255) COMMENT '文章别名',
  `content` LONGTEXT COMMENT '文章内容',
  `summary` VARCHAR(500) COMMENT '文章摘要',
  `cover_image` VARCHAR(255) COMMENT '封面图片',
  `author_id` BIGINT NOT NULL COMMENT '作者ID',
  `category_id` BIGINT COMMENT '分类ID',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-草稿，1-已发布，2-已下线',
  `type` TINYINT DEFAULT 1 COMMENT '类型：1-原创，2-转载，3-翻译',
  `view_count` BIGINT DEFAULT 0 COMMENT '浏览量',
  `like_count` BIGINT DEFAULT 0 COMMENT '点赞数',
  `comment_count` BIGINT DEFAULT 0 COMMENT '评论数',
  `share_count` BIGINT DEFAULT 0 COMMENT '分享数',
  `is_top` TINYINT DEFAULT 0 COMMENT '是否置顶：0-否，1-是',
  `is_recommend` TINYINT DEFAULT 0 COMMENT '是否推荐：0-否，1-是',
  `allow_comment` TINYINT DEFAULT 1 COMMENT '是否允许评论：0-否，1-是',
  `password` VARCHAR(255) COMMENT '访问密码',
  `source_url` VARCHAR(500) COMMENT '原文链接（转载时使用）',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `publish_time` TIMESTAMP NULL COMMENT '发布时间',
  INDEX `idx_author_id` (`author_id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_publish_time` (`publish_time`),
  INDEX `idx_slug` (`slug`),
  FULLTEXT KEY `ft_title_content` (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 评论表
CREATE TABLE IF NOT EXISTS `comment` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
  `article_id` BIGINT NOT NULL COMMENT '文章ID',
  `user_id` BIGINT COMMENT '用户ID',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父评论ID',
  `reply_to_id` BIGINT DEFAULT 0 COMMENT '回复评论ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `author_name` VARCHAR(50) COMMENT '评论者姓名（游客）',
  `author_email` VARCHAR(100) COMMENT '评论者邮箱（游客）',
  `author_website` VARCHAR(255) COMMENT '评论者网站（游客）',
  `author_ip` VARCHAR(50) COMMENT '评论者IP',
  `user_agent` VARCHAR(500) COMMENT '用户代理',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-已拒绝',
  `like_count` BIGINT DEFAULT 0 COMMENT '点赞数',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_article_id` (`article_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 标签表
CREATE TABLE IF NOT EXISTS `tag` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  `slug` VARCHAR(100) COMMENT '标签别名',
  `description` VARCHAR(255) COMMENT '标签描述',
  `color` VARCHAR(20) COMMENT '标签颜色',
  `article_count` BIGINT DEFAULT 0 COMMENT '文章数量',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS `article_tag` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  `article_id` BIGINT NOT NULL COMMENT '文章ID',
  `tag_id` BIGINT NOT NULL COMMENT '标签ID',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_article_tag` (`article_id`, `tag_id`),
  INDEX `idx_article_id` (`article_id`),
  INDEX `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- 相册表
CREATE TABLE IF NOT EXISTS `album` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '相册ID',
  `name` VARCHAR(100) NOT NULL COMMENT '相册名称',
  `description` VARCHAR(255) COMMENT '相册描述',
  `cover_image` VARCHAR(255) COMMENT '封面图片',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-私有，1-公开',
  `photo_count` INT DEFAULT 0 COMMENT '照片数量',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册表';

-- 照片表
CREATE TABLE IF NOT EXISTS `photo` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '照片ID',
  `album_id` BIGINT NOT NULL COMMENT '相册ID',
  `name` VARCHAR(255) NOT NULL COMMENT '照片名称',
  `description` VARCHAR(500) COMMENT '照片描述',
  `url` VARCHAR(500) NOT NULL COMMENT '照片URL',
  `thumbnail_url` VARCHAR(500) COMMENT '缩略图URL',
  `size` BIGINT COMMENT '文件大小（字节）',
  `width` INT COMMENT '图片宽度',
  `height` INT COMMENT '图片高度',
  `format` VARCHAR(20) COMMENT '图片格式',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_album_id` (`album_id`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='照片表';

-- 友链表
CREATE TABLE IF NOT EXISTS `friend_link` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '友链ID',
  `name` VARCHAR(100) NOT NULL COMMENT '网站名称',
  `url` VARCHAR(255) NOT NULL COMMENT '网站链接',
  `logo` VARCHAR(255) COMMENT '网站Logo',
  `description` VARCHAR(255) COMMENT '网站描述',
  `email` VARCHAR(100) COMMENT '站长邮箱',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-已拒绝',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='友链表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `config_type` VARCHAR(20) DEFAULT 'string' COMMENT '配置类型',
  `description` VARCHAR(255) COMMENT '配置描述',
  `deleted` TINYINT DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';