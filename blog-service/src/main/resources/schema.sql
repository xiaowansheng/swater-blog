-- ========================================
-- 博客系统数据库表结构
-- 注意：所有外键关系通过应用层代码维护，不使用数据库外键约束
-- 优点：更好的性能、更灵活的数据管理、避免级联删除问题
-- ========================================

-- 文件元数据表

CREATE TABLE IF NOT EXISTS `file_meta` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `file_hash` VARCHAR(64) NOT NULL COMMENT '文件哈希值',
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `file_type` VARCHAR(50) NOT NULL COMMENT '文件类型',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件存储路径',
  `url` VARCHAR(500) DEFAULT NULL COMMENT '访问URL',
  `file_size` BIGINT NOT NULL COMMENT '文件大小(字节)',
  `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
  `upload_user_id` BIGINT DEFAULT NULL COMMENT '上传用户ID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '文件状态',
  `ref_count` INT NOT NULL DEFAULT '0' COMMENT '引用计数',
  `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '删除标记(0:未删除, 1:已删除)',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_file_hash` (`file_hash`),
  KEY `idx_status` (`status`),
  KEY `idx_upload_user_id` (`upload_user_id`),
  KEY `idx_file_type` (`file_type`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件元数据表';


-- 文件引用关系表

CREATE TABLE IF NOT EXISTS `file_reference` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `file_id` BIGINT NOT NULL COMMENT '文件ID',
  `ref_type` VARCHAR(50) NOT NULL COMMENT '引用类型',
  `ref_id` BIGINT NOT NULL COMMENT '引用对象ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_ref_type_ref_id` (`ref_type`,`ref_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件引用关系表';


-- 用户表

CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户账号ID',
  `username` VARCHAR(50) NOT NULL COMMENT '登录用户名',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  `salt` VARCHAR(50) DEFAULT NULL COMMENT '盐值',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `qq` VARCHAR(15) DEFAULT NULL COMMENT 'QQ号',
  `signature` VARCHAR(100) DEFAULT NULL COMMENT '个性签名',
  `website` VARCHAR(100) DEFAULT NULL COMMENT '个人网站',
  `introduction` VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
  `role_key` VARCHAR(50) DEFAULT 'user' COMMENT '角色标签',
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '状态（0-禁用，1-启用）',
  `disabled` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否禁用',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  `ip_address_signup` VARCHAR(50) DEFAULT NULL COMMENT '注册时IP',
  `ip_source_signup` VARCHAR(100) DEFAULT NULL COMMENT '注册IP所在地',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户账号表';


-- 角色表

CREATE TABLE IF NOT EXISTS `role` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户角色ID',
  `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `role_key` VARCHAR(50) DEFAULT NULL COMMENT '角色标签',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色详情介绍',
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '状态（0-禁用，1-启用）',
  `disabled` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否禁用',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_key` (`role_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色表';


-- 接口资源表

CREATE TABLE IF NOT EXISTS `sys_api` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '资源菜单ID',
  `api_key` VARCHAR(50) NOT NULL COMMENT '资源唯一标识',
  `name` VARCHAR(100) NOT NULL COMMENT '资源名称',
  `path` VARCHAR(255) DEFAULT NULL COMMENT '资源访问路径',
  `method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '资源描述',
  `parent_id` BIGINT NOT NULL DEFAULT '0' COMMENT '父类ID',
  `is_open` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否开放资源（1开放0不开放）',
  `perms` VARCHAR(50) DEFAULT NULL COMMENT '权限标识',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_api_key` (`api_key`),
  UNIQUE KEY `uk_path_method` (`path`,`method`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_is_open` (`is_open`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='接口资源表';


-- 角色接口权限表

CREATE TABLE IF NOT EXISTS `role_api` (
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `api_id` BIGINT NOT NULL COMMENT '资源ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_role_api` (`role_id`,`api_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_api_id` (`api_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色接口权限表';


-- 分类表

CREATE TABLE IF NOT EXISTS `category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `category_key` VARCHAR(50) NOT NULL COMMENT '分类唯一标识',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(100) DEFAULT NULL COMMENT '别名',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `parent_id` BIGINT NOT NULL DEFAULT '0' COMMENT '父级ID',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `status` VARCHAR(10) NOT NULL DEFAULT '1' COMMENT '状态（1-显示，0-隐藏）',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否被删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_key` (`category_key`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章类别表';


-- 标签表

CREATE TABLE IF NOT EXISTS `tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文章标签ID',
  `tag_key` VARCHAR(50) NOT NULL COMMENT '标签唯一标识',
  `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
  `slug` VARCHAR(100) DEFAULT NULL COMMENT '别名',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '颜色',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `status` VARCHAR(10) NOT NULL DEFAULT '1' COMMENT '标签状态（1-显示，0-隐藏）',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_key` (`tag_key`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签表';


-- 文章表

CREATE TABLE IF NOT EXISTS `article` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文章ID',
  `article_key` VARCHAR(50) NOT NULL COMMENT '文章唯一标识',
  `title` VARCHAR(255) NOT NULL COMMENT '文章标题',
  `slug` VARCHAR(255) DEFAULT NULL COMMENT '别名',
  `content` LONGTEXT NOT NULL COMMENT '文章内容',
  `excerpt` TEXT DEFAULT NULL COMMENT '摘要',
  `cover` VARCHAR(512) DEFAULT NULL COMMENT '文章封面',
  `author_id` BIGINT DEFAULT NULL COMMENT '作者ID（与账号表关联）',
  `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
  `type` VARCHAR(20) NOT NULL DEFAULT '1' COMMENT '文章类型（1原创2转载3翻译4引用）',
  `original_author` VARCHAR(30) DEFAULT NULL COMMENT '原文作者',
  `original_title` VARCHAR(50) DEFAULT NULL COMMENT '原文标题',
  `original_url` VARCHAR(512) DEFAULT NULL COMMENT '原文链接',
  `note` VARCHAR(300) DEFAULT NULL COMMENT '文章备注信息',
  `status` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '文章状态（0-草稿，1-已发布，2-私密）',
  `is_top` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '文章是否置顶显示',
  `view_count` INT NOT NULL DEFAULT '0' COMMENT '浏览量',
  `like_count` INT NOT NULL DEFAULT '0' COMMENT '点赞数',
  `comment_count` INT NOT NULL DEFAULT '0' COMMENT '评论数',
  `version` BIGINT NOT NULL DEFAULT '1' COMMENT '版本号（乐观锁）',
  `published_at` DATETIME DEFAULT NULL COMMENT '发布时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_key` (`article_key`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_top` (`is_top`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='博客文章表';


-- 文章标签关联表

CREATE TABLE IF NOT EXISTS `article_tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文章和标签关联ID',
  `article_id` BIGINT NOT NULL COMMENT '文章ID',
  `tag_id` BIGINT NOT NULL COMMENT '标签ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_tag` (`article_id`,`tag_id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章对应标签表';


-- 归档表

CREATE TABLE IF NOT EXISTS `archive` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '归档ID',
  `year` INT NOT NULL COMMENT '年份',
  `month` INT NOT NULL COMMENT '月份',
  `post_count` INT NOT NULL DEFAULT '0' COMMENT '文章数量',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_year_month` (`year`,`month`),
  KEY `idx_year` (`year`),
  KEY `idx_month` (`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='归档表';


-- 说说表

CREATE TABLE IF NOT EXISTS `talk` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '说说ID',
  `talk_key` VARCHAR(50) NOT NULL COMMENT '说说唯一标识',
  `content` LONGTEXT NOT NULL COMMENT '说说内容',
  `images` TEXT DEFAULT NULL COMMENT '图片（JSON数组）',
  `author_id` BIGINT DEFAULT NULL COMMENT '发表人账号ID',
  `like_count` INT NOT NULL DEFAULT '0' COMMENT '点赞数',
  `comment_count` INT NOT NULL DEFAULT '0' COMMENT '评论数',
  `view_count` INT NOT NULL DEFAULT '0' COMMENT '浏览数',
  `status` VARCHAR(20) NOT NULL DEFAULT '1' COMMENT '状态（1显示2私密）',
  `is_top` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '置顶（1置顶0不置顶）',
  `ip` VARCHAR(255) DEFAULT NULL COMMENT 'IP地址',
  `country` VARCHAR(50) DEFAULT NULL COMMENT '国家',
  `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `location` VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
  `device` VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
  `browser` VARCHAR(50) DEFAULT NULL COMMENT '浏览器',
  `point` POINT DEFAULT NULL COMMENT '坐标点',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_talk_key` (`talk_key`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_top` (`is_top`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='说说表';


-- 评论表

CREATE TABLE IF NOT EXISTS `comment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `images` VARCHAR(2048) DEFAULT '[]' COMMENT '图片（JSON数组）',
  `target_id` BIGINT NOT NULL COMMENT '评论目标ID（文章/说说）',
  `target_type` VARCHAR(20) NOT NULL COMMENT '评论目标类型(ARTICLE/TALK)',
  `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
  `parent_id` BIGINT NOT NULL DEFAULT '0' COMMENT '回复的评论ID',
  `root_id` BIGINT NOT NULL DEFAULT '0' COMMENT '根评论ID',
  `type` VARCHAR(20) NOT NULL COMMENT '评论类型(1登录评论2游客评论3匿名评论)',
  `nickname` VARCHAR(30) DEFAULT NULL COMMENT '游客别名',
  `email` VARCHAR(128) DEFAULT NULL COMMENT '游客邮箱',
  `qq` VARCHAR(15) DEFAULT NULL COMMENT '游客QQ号',
  `status` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '审核状态（0-待审核，1-已通过）',
  `is_visible` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否隐藏评论',
  `ip` VARCHAR(255) NOT NULL COMMENT 'IP地址',
  `country` VARCHAR(50) DEFAULT NULL COMMENT '国家',
  `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `location` VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
  `device` VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
  `browser` VARCHAR(50) NOT NULL DEFAULT '未知浏览器' COMMENT '使用的浏览器',
  `point` POINT DEFAULT NULL COMMENT '坐标点',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_target_id` (`target_id`),
  KEY `idx_target_type` (`target_type`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_root_id` (`root_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论信息表';


-- 友链表

CREATE TABLE IF NOT EXISTS `friend_link` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '友情链接ID',
  `name` VARCHAR(100) NOT NULL COMMENT '友链名称',
  `url` VARCHAR(255) NOT NULL COMMENT '链接地址',
  `logo` VARCHAR(255) DEFAULT NULL COMMENT 'Logo',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `author` VARCHAR(30) DEFAULT NULL COMMENT '网站作者',
  `email` VARCHAR(255) DEFAULT NULL COMMENT '联系邮箱',
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '状态（0-禁用，1-启用）',
  `is_visible` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否可见',
  `review_status` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '审核状态',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `user_id` BIGINT DEFAULT NULL COMMENT '申请用户ID',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`),
  KEY `idx_email` (`email`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='友情链接表';


-- 配置表

CREATE TABLE IF NOT EXISTS `sys_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `name` VARCHAR(50) NOT NULL COMMENT '配置参数显示名称',
  `value` TEXT NOT NULL COMMENT '配置值',
  `type` VARCHAR(20) NOT NULL DEFAULT 'string' COMMENT '类型（string/int/boolean/json）',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `group_name` VARCHAR(50) DEFAULT NULL COMMENT '分组',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`),
  KEY `idx_group_name` (`group_name`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网站配置信息表';


-- 通知表

CREATE TABLE IF NOT EXISTS `sys_notification` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `type` VARCHAR(50) NOT NULL COMMENT '通知类型',
  `title` VARCHAR(255) NOT NULL COMMENT '通知标题',
  `content` TEXT DEFAULT NULL COMMENT '通知内容',
  `is_read` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已读',
  `notice_type` VARCHAR(50) DEFAULT NULL COMMENT '通知类型（兼容字段）',
  `channel` VARCHAR(20) DEFAULT NULL COMMENT '发送渠道',
  `recipient` VARCHAR(255) DEFAULT NULL COMMENT '接收者标识',
  `template_id` VARCHAR(64) DEFAULT NULL COMMENT '通知模板ID',
  `template_params` JSON DEFAULT NULL COMMENT '模板参数',
  `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '通知状态',
  `send_count` INT DEFAULT '0' COMMENT '发送次数',
  `max_retry_count` INT DEFAULT '3' COMMENT '最大重试次数',
  `next_retry_time` DATETIME DEFAULT NULL COMMENT '下次重试时间',
  `sent_time` DATETIME DEFAULT NULL COMMENT '发送时间',
  `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
  `business_id` VARCHAR(64) DEFAULT NULL COMMENT '业务关联ID',
  `business_type` VARCHAR(50) DEFAULT NULL COMMENT '业务类型',
  `priority` INT DEFAULT '5' COMMENT '优先级',
  `immediate` TINYINT(1) DEFAULT '0' COMMENT '是否立即发送',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `deleted` TINYINT(1) DEFAULT '0' COMMENT '逻辑删除标识',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统通知表';


-- 访客表

CREATE TABLE IF NOT EXISTS `visitor` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '访客ID',
  `visitor_uuid` VARCHAR(64) NOT NULL COMMENT '访客唯一标识',
  `ip` VARCHAR(255) NOT NULL COMMENT 'IP地址',
  `country` VARCHAR(50) DEFAULT NULL COMMENT '国家',
  `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `location` VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
  `visit_count` INT NOT NULL DEFAULT '1' COMMENT '访问次数',
  `last_visit_time` DATETIME NOT NULL COMMENT '最后访问时间',
  `first_visit_time` DATETIME NOT NULL COMMENT '首次访问时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '访客状态',
  `district` VARCHAR(100) DEFAULT NULL COMMENT '区/县',
  `isp` VARCHAR(100) DEFAULT NULL COMMENT 'ISP运营商',
  `timezone` VARCHAR(50) DEFAULT NULL COMMENT '时区',
  `device_type` VARCHAR(50) DEFAULT NULL COMMENT '设备类型',
  `device_brand` VARCHAR(50) DEFAULT NULL COMMENT '设备品牌',
  `device_model` VARCHAR(100) DEFAULT NULL COMMENT '设备型号',
  `os_name` VARCHAR(50) DEFAULT NULL COMMENT '操作系统名称',
  `os_version` VARCHAR(50) DEFAULT NULL COMMENT '操作系统版本',
  `browser_name` VARCHAR(50) DEFAULT NULL COMMENT '浏览器名称',
  `browser_version` VARCHAR(50) DEFAULT NULL COMMENT '浏览器版本',
  `traffic_source` VARCHAR(50) DEFAULT NULL COMMENT '流量来源分类',
  `referer_url` VARCHAR(500) DEFAULT NULL COMMENT '来源页面URL',
  `search_engine` VARCHAR(50) DEFAULT NULL COMMENT '搜索引擎名称',
  `search_keywords` VARCHAR(200) DEFAULT NULL COMMENT '搜索关键词',
  `utm_source` VARCHAR(100) DEFAULT NULL COMMENT 'UTM来源参数',
  `utm_medium` VARCHAR(100) DEFAULT NULL COMMENT 'UTM媒介参数',
  `utm_campaign` VARCHAR(100) DEFAULT NULL COMMENT 'UTM活动参数',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_visitor_uuid` (`visitor_uuid`),
  KEY `idx_last_visit_time` (`last_visit_time`),
  KEY `idx_country` (`country`),
  KEY `idx_city` (`city`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访客记录表';


-- 操作日志表

CREATE TABLE IF NOT EXISTS `log_operation` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '操作日志ID',
  `user_id` BIGINT DEFAULT NULL COMMENT '操作用户ID',
  `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
  `operation` VARCHAR(100) NOT NULL COMMENT '操作',
  `method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
  `path` VARCHAR(255) DEFAULT NULL COMMENT '请求路径',
  `params` TEXT DEFAULT NULL COMMENT '请求参数',
  `result` TEXT DEFAULT NULL COMMENT '返回结果',
  `ip` VARCHAR(255) DEFAULT NULL COMMENT 'IP地址',
  `duration` BIGINT DEFAULT NULL COMMENT '耗时（毫秒）',
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '状态（0-失败，1-成功）',
  `error_msg` TEXT DEFAULT NULL COMMENT '错误信息',
  `version` VARCHAR(128) DEFAULT NULL COMMENT '项目版本',
  `module` VARCHAR(20) DEFAULT NULL COMMENT '操作模块',
  `calling_method` VARCHAR(255) DEFAULT NULL COMMENT '调用的方法',
  `type` VARCHAR(20) DEFAULT NULL COMMENT '操作类型（新增、修改...）',
  `description` VARCHAR(100) DEFAULT NULL COMMENT '操作描述信息',
  `request_url` VARCHAR(255) DEFAULT NULL COMMENT '请求地址',
  `request_method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
  `request_param` LONGTEXT DEFAULT NULL COMMENT '请求参数',
  `response_data` LONGTEXT DEFAULT NULL COMMENT '响应参数',
  `elapsed_time` BIGINT DEFAULT NULL COMMENT '操作执行耗时毫秒数',
  `device` VARCHAR(50) DEFAULT NULL COMMENT '设备',
  `browser` VARCHAR(50) DEFAULT NULL COMMENT '浏览器',
  `ip_source` VARCHAR(150) DEFAULT NULL COMMENT 'ip归属地',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否被删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_status` (`status`),
  KEY `idx_operation` (`operation`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';


-- 异常日志表

CREATE TABLE IF NOT EXISTS `log_error` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '异常日志ID',
  `user_id` BIGINT DEFAULT NULL COMMENT '操作用户ID',
  `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
  `exception_type` VARCHAR(255) DEFAULT NULL COMMENT '异常类型',
  `exception_msg` TEXT DEFAULT NULL COMMENT '异常信息',
  `stack_trace` LONGTEXT DEFAULT NULL COMMENT '堆栈信息',
  `method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
  `path` VARCHAR(255) DEFAULT NULL COMMENT '请求路径',
  `params` TEXT DEFAULT NULL COMMENT '请求参数',
  `ip` VARCHAR(255) DEFAULT NULL COMMENT 'IP地址',
  `version` VARCHAR(128) DEFAULT NULL COMMENT '系统版本',
  `request_url` VARCHAR(255) DEFAULT NULL COMMENT '请求地址',
  `request_method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
  `request_param` LONGTEXT DEFAULT NULL COMMENT '请求参数',
  `module` VARCHAR(50) DEFAULT NULL COMMENT '模块',
  `calling_method` VARCHAR(255) DEFAULT NULL COMMENT '调用方法',
  `error_name` VARCHAR(255) DEFAULT NULL COMMENT '异常名称',
  `error_message` TEXT DEFAULT NULL COMMENT '异常信息',
  `ip_source` VARCHAR(150) DEFAULT NULL COMMENT 'ip所在地',
  `device` VARCHAR(50) DEFAULT NULL COMMENT '设备',
  `browser` VARCHAR(50) DEFAULT NULL COMMENT '浏览器',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_exception_type` (`exception_type`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统异常错误日志表';


-- 菜单表

CREATE TABLE IF NOT EXISTS `sys_menu` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `title` VARCHAR(50) NOT NULL COMMENT '菜单标题',
  `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标',
  `redirect` VARCHAR(100) DEFAULT NULL COMMENT '路由重定向',
  `path` VARCHAR(100) NOT NULL COMMENT '路由地址',
  `component` VARCHAR(200) DEFAULT NULL COMMENT '组件路径',
  `hidden` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '隐藏菜单（0展示1隐藏）',
  `sort` INT NOT NULL DEFAULT '0' COMMENT '排序',
  `parent_id` BIGINT NOT NULL DEFAULT '0' COMMENT '父类ID',
  `perms` VARCHAR(50) DEFAULT NULL COMMENT '权限标识',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述信息',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort` (`sort`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单目录表';


-- 角色菜单关联表

CREATE TABLE IF NOT EXISTS `role_menu` (
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `menu_id` BIGINT NOT NULL COMMENT '系统菜单ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_role_menu` (`role_id`,`menu_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单关联表';


-- 留言簿表

CREATE TABLE IF NOT EXISTS `guestbook` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '留言ID',
  `content` VARCHAR(1024) NOT NULL COMMENT '留言内容',
  `images` VARCHAR(2048) DEFAULT '[]' COMMENT '图片（JSON数组）',
  `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
  `type` VARCHAR(20) NOT NULL COMMENT '留言类型(1登录留言2游客留言3匿名留言)',
  `nickname` VARCHAR(30) DEFAULT NULL COMMENT '游客别名',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '游客邮箱',
  `qq` VARCHAR(15) DEFAULT NULL COMMENT '游客QQ号',
  `ip` VARCHAR(255) NOT NULL COMMENT 'IP地址',
  `country` VARCHAR(50) DEFAULT NULL COMMENT '国家',
  `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `location` VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
  `device` VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
  `browser` VARCHAR(50) NOT NULL DEFAULT '未知浏览器' COMMENT '使用的浏览器',
  `point` POINT DEFAULT NULL COMMENT '坐标点',
  `is_visible` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否隐藏留言',
  `review_status` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '审核状态',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_review_status` (`review_status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留言簿表';


-- 相册表

CREATE TABLE IF NOT EXISTS `album` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '相册ID',
  `album_key` VARCHAR(50) NOT NULL COMMENT '相册唯一标识',
  `user_id` BIGINT DEFAULT NULL COMMENT '相册创建人账号ID',
  `name` VARCHAR(50) NOT NULL COMMENT '相册名称',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '相册描述',
  `cover` VARCHAR(255) DEFAULT NULL COMMENT '相册封面',
  `status` VARCHAR(20) NOT NULL DEFAULT '1' COMMENT '相册状态（1公开2私密）',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_album_key` (`album_key`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册表';


-- 图片表

CREATE TABLE IF NOT EXISTS `picture` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '图片ID',
  `user_id` BIGINT DEFAULT NULL COMMENT '图片上传人账号ID',
  `album_id` BIGINT NOT NULL COMMENT '相册ID',
  `name` VARCHAR(100) NOT NULL COMMENT '图片名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '图片描述',
  `url` VARCHAR(512) NOT NULL COMMENT '图片地址',
  `source` VARCHAR(20) DEFAULT NULL COMMENT '图片来源（0未知1原创2二创3转载）',
  `status` VARCHAR(20) NOT NULL DEFAULT '1' COMMENT '状态',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_album_id` (`album_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片表';


-- 分享分类表

CREATE TABLE IF NOT EXISTS `share_category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(30) NOT NULL COMMENT '分类名',
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '状态(1公开2私密)',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分享分类表';


-- 访问统计表

CREATE TABLE IF NOT EXISTS `visit_statistics` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `page_type` VARCHAR(20) NOT NULL COMMENT '页面类型',
  `page_id` VARCHAR(255) DEFAULT NULL COMMENT '页面ID',
  `statistics_date` DATETIME NOT NULL COMMENT '统计日期',
  `visit_count` BIGINT NOT NULL DEFAULT '0' COMMENT '访问量',
  `unique_visitor_count` BIGINT NOT NULL DEFAULT '0' COMMENT '独立访客数',
  `geo_statistics` TEXT DEFAULT NULL COMMENT '地理位置统计(JSON)',
  `device_statistics` TEXT DEFAULT NULL COMMENT '设备统计(JSON)',
  `browser_statistics` TEXT DEFAULT NULL COMMENT '浏览器统计(JSON)',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_type_page_id_date` (`page_type`,`page_id`,`statistics_date`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_statistics_date` (`statistics_date`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访问量统计表';


-- 访客访问记录表

CREATE TABLE IF NOT EXISTS `visitor_access_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '访问记录ID',
  `visitor_id` BIGINT NOT NULL COMMENT '访客ID',
  `visitor_uuid` VARCHAR(64) NOT NULL COMMENT '访客唯一标识',
  `ip` VARCHAR(128) NOT NULL COMMENT 'IP地址',
  `page_type` VARCHAR(20) NOT NULL COMMENT '页面类型',
  `page_id` VARCHAR(255) DEFAULT NULL COMMENT '页面ID',
  `page_url` VARCHAR(500) DEFAULT NULL COMMENT '页面URL',
  `session_id` VARCHAR(64) DEFAULT NULL COMMENT '会话ID',
  `is_new_visitor` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否为新访客',
  `access_time` DATETIME NOT NULL COMMENT '访问时间',
  `traffic_source` VARCHAR(20) DEFAULT 'UNKNOWN' COMMENT '流量来源分类',
  `referer_url` VARCHAR(500) DEFAULT NULL COMMENT '来源页面URL',
  `search_engine` VARCHAR(50) DEFAULT NULL COMMENT '搜索引擎名称',
  `search_keywords` VARCHAR(200) DEFAULT NULL COMMENT '搜索关键词',
  `utm_source` VARCHAR(100) DEFAULT NULL COMMENT 'UTM来源参数',
  `utm_medium` VARCHAR(100) DEFAULT NULL COMMENT 'UTM媒介参数',
  `utm_campaign` VARCHAR(100) DEFAULT NULL COMMENT 'UTM活动参数',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_visitor_id` (`visitor_id`),
  KEY `idx_visitor_uuid` (`visitor_uuid`),
  KEY `idx_ip` (`ip`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_access_time` (`access_time`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_traffic_source` (`traffic_source`),
  KEY `idx_traffic_date` (`traffic_source`,`access_time`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访客访问记录表';


-- ========================================
-- 访问追踪（V2）
-- ========================================

-- 访客会话（30分钟）
CREATE TABLE IF NOT EXISTS `visitor_session` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `visitor_id` BIGINT NOT NULL COMMENT '访客ID',
  `session_id` VARCHAR(64) NOT NULL COMMENT '会话标识',
  `started_at` DATETIME NOT NULL COMMENT '会话开始时间',
  `last_activity_at` DATETIME NOT NULL COMMENT '最后活跃时间',
  `entry_page_key` VARCHAR(300) DEFAULT NULL COMMENT '入口页面Key',
  `entry_referer` VARCHAR(500) DEFAULT NULL COMMENT '入口来源',
  `utm_source` VARCHAR(100) DEFAULT NULL COMMENT 'UTM来源',
  `utm_medium` VARCHAR(100) DEFAULT NULL COMMENT 'UTM媒介',
  `utm_campaign` VARCHAR(100) DEFAULT NULL COMMENT 'UTM活动',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_visitor_session` (`visitor_id`, `session_id`),
  KEY `idx_visitor_last_activity` (`visitor_id`, `last_activity_at`),
  KEY `idx_started_at` (`started_at`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访客会话（V2）';

-- 页面PV（会话内同页一次）
CREATE TABLE IF NOT EXISTS `page_view` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '页面PV ID',
  `visitor_id` BIGINT NOT NULL COMMENT '访客ID',
  `session_id` VARCHAR(64) NOT NULL COMMENT '会话标识',
  `page_key` VARCHAR(300) NOT NULL COMMENT '页面Key',
  `page_url` VARCHAR(800) DEFAULT NULL COMMENT '页面URL',
  `referer` VARCHAR(500) DEFAULT NULL COMMENT '来源URL',
  `occurred_at` DATETIME NOT NULL COMMENT '发生时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_page` (`visitor_id`, `session_id`, `page_key`),
  KEY `idx_occurred_at` (`occurred_at`),
  KEY `idx_page_key_time` (`page_key`, `occurred_at`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面浏览（V2）';

-- 内容阅读（24h 去重）
CREATE TABLE IF NOT EXISTS `content_read` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '内容阅读ID',
  `visitor_id` BIGINT NOT NULL COMMENT '访客ID',
  `content_type` VARCHAR(16) NOT NULL COMMENT '内容类型(ARTICLE/TALK)',
  `content_id` BIGINT NOT NULL COMMENT '内容ID',
  `last_counted_at` DATETIME NOT NULL COMMENT '最后一次计数时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_visitor_content` (`visitor_id`, `content_type`, `content_id`),
  KEY `idx_last_counted_at` (`last_counted_at`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容阅读去重（V2）';

-- 内容指标事件（趋势/Top 内容用，不影响展示累计值）
CREATE TABLE IF NOT EXISTS `content_metric_event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '事件ID',
  `visitor_id` BIGINT DEFAULT NULL COMMENT '访客ID(可空)',
  `metric` VARCHAR(16) NOT NULL COMMENT '指标(READ/LIKE/COMMENT)',
  `content_type` VARCHAR(16) NOT NULL COMMENT '内容类型(ARTICLE/TALK)',
  `content_id` BIGINT NOT NULL COMMENT '内容ID',
  `delta` INT NOT NULL COMMENT '增量(+1/-1)',
  `occurred_at` DATETIME NOT NULL COMMENT '发生时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_time` (`occurred_at`),
  KEY `idx_metric_time` (`metric`, `occurred_at`),
  KEY `idx_content_metric_time` (`content_type`, `content_id`, `metric`, `occurred_at`),
  KEY `idx_visitor_time` (`visitor_id`, `occurred_at`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容指标事件（V2）';


