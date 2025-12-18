-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: blog
-- ------------------------------------------------------
-- Server version	8.4.7
-- 完善版本：统一字符集、字段类型、添加缺失字段和索引

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `file_meta`
--

DROP TABLE IF EXISTS `file_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_meta` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `file_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件哈希值',
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始文件名',
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件类型',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件存储路径',
  `file_size` bigint NOT NULL COMMENT '文件大小(字节)',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '文件状态',
  `ref_count` int NOT NULL DEFAULT '0' COMMENT '引用计数',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除标记(0:未删除, 1:已删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_file_hash` (`file_hash`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件元数据表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `file_reference`
--

DROP TABLE IF EXISTS `file_reference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_reference` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `file_id` int NOT NULL COMMENT '文件ID',
  `ref_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '引用类型',
  `ref_id` int NOT NULL COMMENT '引用对象ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_ref_type_ref_id` (`ref_type`,`ref_id`),
  KEY `idx_create_time` (`create_time`),
  CONSTRAINT `fk_file_reference_file_id` FOREIGN KEY (`file_id`) REFERENCES `file_meta` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件引用关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_error`
--

DROP TABLE IF EXISTS `log_error`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_error` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '异常日志ID',
  `user_id` int DEFAULT NULL COMMENT '操作用户ID',
  `version` varchar(128) NOT NULL COMMENT '系统版本',
  `request_url` varchar(255) NOT NULL COMMENT '请求地址',
  `request_method` varchar(10) NOT NULL DEFAULT 'GET' COMMENT '请求参数',
  `request_param` longtext NOT NULL COMMENT '请求参数',
  `module` varchar(50) NOT NULL,
  `calling_method` varchar(255) NOT NULL COMMENT '调用方法',
  `error_name` varchar(255) NOT NULL COMMENT '异常名称',
  `error_message` text NOT NULL COMMENT '异常信息',
  `ip_address` varchar(128) NOT NULL COMMENT 'IP地址',
  `ip_source` varchar(150) NOT NULL COMMENT 'ip所在地',
  `device` varchar(50) NOT NULL DEFAULT '未知设备',
  `browser` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统异常错误日志';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_operation`
--

DROP TABLE IF EXISTS `log_operation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_operation` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '操作日志ID',
  `user_id` int DEFAULT NULL COMMENT '操作用户ID',
  `version` varchar(128) NOT NULL COMMENT '项目版本',
  `request_url` varchar(255) NOT NULL COMMENT '请求地址',
  `module` varchar(20) NOT NULL COMMENT '操作模块',
  `calling_method` varchar(255) NOT NULL COMMENT '调用的方法',
  `type` varchar(20) NOT NULL COMMENT '操作类型（新增、修改...）',
  `description` varchar(100) NOT NULL COMMENT '操作描述信息',
  `request_method` varchar(10) NOT NULL COMMENT '请求方法',
  `request_param` longtext NOT NULL COMMENT '请求参数',
  `response_data` longtext NOT NULL COMMENT '响应参数',
  `elapsed_time` bigint NOT NULL COMMENT '操作执行耗时毫秒数',
  `ip_address` varchar(128) NOT NULL COMMENT '请求IP',
  `ip_source` varchar(150) NOT NULL COMMENT 'ip归属地',
  `device` varchar(50) NOT NULL DEFAULT '未知设备',
  `browser` varchar(50) NOT NULL DEFAULT '未知浏览器',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否被删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_api`
--

DROP TABLE IF EXISTS `sys_api`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_api` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '资源菜单ID',
  `key` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL COMMENT '资源名称',
  `request_method` varchar(10) DEFAULT NULL COMMENT '请求方法',
  `path` varchar(255) DEFAULT NULL COMMENT '资源访问路径',
  `open` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否开放资源（1开放0不开放）',
  `parent_id` int NOT NULL DEFAULT '0' COMMENT '父类ID',
  `perms` varchar(50) DEFAULT NULL COMMENT '权限标识',
  `description` varchar(100) DEFAULT NULL COMMENT '资源描述',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `resource_key_UNIQUE` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=203 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='资源菜单';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_config`
--

DROP TABLE IF EXISTS `sys_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置参数名',
  `name` varchar(50) NOT NULL COMMENT '配置参数显示名称',
  `value` varchar(8192) NOT NULL COMMENT '配置参数值',
  `description` varchar(50) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='网站配置信息';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_menu`
--

DROP TABLE IF EXISTS `sys_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(50) NOT NULL COMMENT '菜单名称',
  `title` varchar(50) NOT NULL COMMENT '菜单标题',
  `icon` varchar(255) NOT NULL COMMENT '图标',
  `redirect` varchar(100) DEFAULT NULL COMMENT '路由重定向',
  `path` varchar(100) NOT NULL COMMENT '路由地址',
  `component` varchar(200) DEFAULT NULL COMMENT '组件路径',
  `hidden` tinyint(1) NOT NULL DEFAULT '0' COMMENT '隐藏菜单（0展示1隐藏）',
  `sort` tinyint NOT NULL DEFAULT '0' COMMENT '排序',
  `parent_id` int NOT NULL DEFAULT '0' COMMENT '父类ID',
  `perms` varchar(50) DEFAULT NULL COMMENT '权限标识',
  `description` varchar(100) DEFAULT NULL COMMENT '描述信息',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `menu_key_UNIQUE` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='菜单目录';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_notification`
--

DROP TABLE IF EXISTS `sys_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_notification` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `notice_type` varchar(50) NOT NULL COMMENT '通知类型',
  `channel` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发送渠道',
  `recipient` varchar(255) NOT NULL COMMENT '接收者标识',
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '通知标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '通知内容',
  `template_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '通知模板ID',
  `template_params` json DEFAULT NULL COMMENT '模板参数',
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT '通知状态',
  `send_count` int DEFAULT '0' COMMENT '发送次数',
  `max_retry_count` int DEFAULT '3' COMMENT '最大重试次数',
  `next_retry_time` datetime DEFAULT NULL COMMENT '下次重试时间',
  `sent_time` datetime DEFAULT NULL COMMENT '发送时间',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `business_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '业务关联ID',
  `business_type` varchar(50) DEFAULT NULL COMMENT '业务类型',
  `priority` int DEFAULT '5' COMMENT '优先级',
  `immediate` tinyint(1) DEFAULT '0' COMMENT '是否立即发送',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除标识',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_recipient` (`recipient`),
  KEY `idx_notice_type` (`notice_type`),
  KEY `idx_business` (`business_id`,`business_type`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_expire_time` (`expire_time`),
  KEY `idx_next_retry_time` (`next_retry_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统通知表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_album`
--

DROP TABLE IF EXISTS `t_album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_album` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '相册ID',
  `album_key` varchar(50) NOT NULL,
  `user_id` int DEFAULT NULL COMMENT '相册创建人账号ID',
  `name` varchar(50) NOT NULL COMMENT '相册名称',
  `description` varchar(200) NOT NULL COMMENT '相册描述',
  `cover` varchar(255) DEFAULT NULL COMMENT '相册封面',
  `status` varchar(20) NOT NULL COMMENT '相册状态（1公开2私密）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `album_key_UNIQUE` (`album_key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='相册';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_article`
--

DROP TABLE IF EXISTS `t_article`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_article` (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_key` varchar(50) NOT NULL,
  `user_id` int DEFAULT NULL COMMENT '作者ID（与账号表关联）',
  `category_id` int DEFAULT NULL COMMENT '分类ID',
  `title` varchar(150) NOT NULL COMMENT '文章标题',
  `cover` varchar(512) DEFAULT NULL COMMENT '文章封面（需赋默认值）',
  `content` longtext NOT NULL COMMENT '文章内容',
  `type` varchar(20) NOT NULL COMMENT '文章类型（1原创2转载3翻译4引用）',
  `original_author` varchar(30) DEFAULT NULL COMMENT '原文作者',
  `original_title` varchar(50) DEFAULT NULL COMMENT '原文标题',
  `original_url` varchar(512) DEFAULT NULL COMMENT '原文链接',
  `note` varchar(300) DEFAULT NULL COMMENT '文章备注信息',
  `top` tinyint(1) NOT NULL DEFAULT '0' COMMENT '文章是否置顶显示',
  `status` varchar(20) NOT NULL COMMENT '文章状态（1展示2私密3评论可见）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_key_UNIQUE` (`article_key`)
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='博客文章';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_article_tag`
--

DROP TABLE IF EXISTS `t_article_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_article_tag` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '文章和标签关联ID',
  `article_id` int NOT NULL COMMENT '文章ID',
  `tag_id` int NOT NULL COMMENT '标签ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=359 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文章对应标签';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_category`
--

DROP TABLE IF EXISTS `t_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_category` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `category_key` varchar(50) NOT NULL,
  `name` varchar(30) NOT NULL COMMENT '分类名称',
  `description` varchar(100) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否被删除',
  `status` varchar(10) NOT NULL COMMENT '是否隐藏该分类',
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_key_UNIQUE` (`category_key`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文章类别';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_comment`
--

DROP TABLE IF EXISTS `t_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_comment` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `comment_key` varchar(50) DEFAULT NULL COMMENT '评论唯一标识',
  `user_id` int DEFAULT NULL COMMENT '用户ID',
  `topic_type` varchar(20) NOT NULL COMMENT '评论类型（1文章2说说3写作4友联）',
  `topic_id` int DEFAULT NULL COMMENT '评论的主题ID（文章ID说说ID...）',
  `content` text NOT NULL COMMENT '评论内容',
  `images` varchar(2048) DEFAULT '[]',
  `ip_address` varchar(50) NOT NULL COMMENT 'ip地址',
  `ip_source` varchar(100) NOT NULL COMMENT 'ip所在地',
  `device` varchar(50) NOT NULL DEFAULT '未知设备' COMMENT '使用设备',
  `browser` varchar(50) NOT NULL DEFAULT '未知浏览器' COMMENT '使用的浏览器',
  `point` point DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `root_id` int NOT NULL DEFAULT '0' COMMENT '根评论id',
  `parent_id` int NOT NULL DEFAULT '0' COMMENT '回复的评论ID',
  `type` varchar(20) NOT NULL COMMENT '评论类型(1登录评论2游客评论3匿名评论)',
  `nickname` varchar(30) DEFAULT NULL COMMENT '游客别名',
  `email` varchar(128) DEFAULT NULL COMMENT '游客邮箱',
  `qq` varchar(15) DEFAULT NULL COMMENT '游客QQ号',
  `is_visible` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否隐藏评论',
  `review_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '审核状态',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_UNIQUE` (`comment_key`)
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='评论信息';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_friend`
--

DROP TABLE IF EXISTS `t_friend`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_friend` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '友情链接ID',
  `user_id` int DEFAULT NULL,
  `name` varchar(30) NOT NULL COMMENT '网站名称',
  `icon` varchar(256) NOT NULL COMMENT '网站图标链接',
  `url` varchar(255) NOT NULL COMMENT '网站地址',
  `author` varchar(30) NOT NULL DEFAULT '【未填写】' COMMENT '网站作者',
  `introduction` varchar(200) NOT NULL COMMENT '网站介绍',
  `is_visible` tinyint(1) NOT NULL DEFAULT '0',
  `review_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '审核状态',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='友情链接';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_guestbook`
--

DROP TABLE IF EXISTS `t_guestbook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_guestbook` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '留言ID',
  `guestbook_key` varchar(50) NOT NULL,
  `user_id` int DEFAULT NULL COMMENT '用户ID',
  `content` varchar(1024) NOT NULL COMMENT '留言内容',
  `images` varchar(2048) DEFAULT '[]',
  `ip_address` varchar(50) NOT NULL COMMENT 'ip地址',
  `ip_source` varchar(100) NOT NULL COMMENT 'ip所在地',
  `device` varchar(50) NOT NULL DEFAULT '未知设备' COMMENT '使用设备',
  `browser` varchar(50) NOT NULL DEFAULT '未知浏览器' COMMENT '使用的浏览器',
  `point` point DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `type` varchar(20) NOT NULL COMMENT '留言类型(1登录留言2游客留言3匿名留言)',
  `nickname` varchar(30) DEFAULT NULL COMMENT '游客别名',
  `email` varchar(100) DEFAULT NULL COMMENT '游客邮箱',
  `qq` varchar(15) DEFAULT NULL COMMENT '游客QQ号',
  `is_visible` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否隐藏留言',
  `review_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '审核状态',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `guestbook_key_UNIQUE` (`guestbook_key`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='留言簿';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_login_log`
--

DROP TABLE IF EXISTS `t_login_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_login_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_auth_id` int NOT NULL COMMENT '用户账号',
  `ip_address` varchar(50) NOT NULL COMMENT 'ip地址',
  `ip_source` varchar(100) NOT NULL COMMENT 'ip来源',
  `device` varchar(50) NOT NULL DEFAULT '未知设备' COMMENT '设备名称',
  `browser` varchar(50) NOT NULL DEFAULT '未知浏览器' COMMENT '浏览器信息',
  `point` point DEFAULT NULL COMMENT '坐标',
  `location` varchar(100) DEFAULT NULL COMMENT '位置',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='登录日志，记录用户的登录信息';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_page_view`
--

DROP TABLE IF EXISTS `t_page_view`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_page_view` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '访问量ID',
  `count` bigint NOT NULL DEFAULT '0' COMMENT '访问量',
  `view_type` varchar(20) NOT NULL COMMENT '访问量类型（1网站访问量2博客文章访问量3说说访问量4写作文章访问量5相册访问量6友链访问量....）',
  `view_id` int DEFAULT NULL COMMENT '不同访问类型的对应表ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='访问量';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_picture`
--

DROP TABLE IF EXISTS `t_picture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_picture` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '图片ID',
  `user_id` int DEFAULT NULL COMMENT '图片上传人账号ID',
  `album_id` int NOT NULL COMMENT '相册ID',
  `name` varchar(100) NOT NULL COMMENT '图片名称',
  `description` varchar(100) DEFAULT NULL COMMENT '图片描述',
  `url` varchar(512) NOT NULL COMMENT '图片地址',
  `source` varchar(20) DEFAULT NULL COMMENT '图片来源（0未知1原创2二创3转载）',
  `status` varchar(20) NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='图片';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_role`
--

DROP TABLE IF EXISTS `t_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户角色ID',
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `role_key` varchar(50) DEFAULT NULL COMMENT '角色标签',
  `description` varchar(100) DEFAULT NULL COMMENT '角色详情介绍',
  `disabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_label_UNIQUE` (`role_key`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户角色';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_role_api`
--

DROP TABLE IF EXISTS `t_role_api`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_role_api` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '角色资源ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `api_id` int NOT NULL COMMENT '资源ID',
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5496 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色资源';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_role_menu`
--

DROP TABLE IF EXISTS `t_role_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_role_menu` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '角色菜单ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `menu_id` int NOT NULL COMMENT '系统菜单ID',
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2309 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色菜单';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_share_category`
--

DROP TABLE IF EXISTS `t_share_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_share_category` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(30) NOT NULL COMMENT '分类名',
  `status` tinyint(1) NOT NULL COMMENT '状态(1公开2私密)',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='分享分类';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_tag`
--

DROP TABLE IF EXISTS `t_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_tag` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '文章标签ID',
  `tag_key` varchar(50) NOT NULL,
  `name` varchar(30) NOT NULL COMMENT '标签名称',
  `description` varchar(100) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `status` varchar(10) NOT NULL COMMENT '标签状态',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tag_key_UNIQUE` (`tag_key`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文章标签';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_talk`
--

DROP TABLE IF EXISTS `t_talk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_talk` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '说说ID',
  `talk_key` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL COMMENT '发表人账号ID',
  `content` longtext NOT NULL COMMENT '说说内容',
  `images` varchar(4096) NOT NULL DEFAULT '[]' COMMENT '图片',
  `status` varchar(20) NOT NULL COMMENT '状态（1显示2私密）',
  `top` tinyint(1) NOT NULL DEFAULT '0' COMMENT '置顶（1置顶0不置顶）',
  `ip_address` varchar(100) DEFAULT NULL COMMENT 'ip地址',
  `ip_source` varchar(100) DEFAULT NULL COMMENT 'ip来源',
  `device` varchar(50) DEFAULT '未知设备' COMMENT '使用设备',
  `browser` varchar(50) DEFAULT '未知浏览器' COMMENT '使用浏览器',
  `point` point DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `talk_key_UNIQUE` (`talk_key`)
) ENGINE=InnoDB AUTO_INCREMENT=235 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='说说';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_user`
--

DROP TABLE IF EXISTS `t_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户账号ID',
  `username` varchar(50) NOT NULL COMMENT '登录用户名（一般是用户信息的邮箱）',
  `password` varchar(128) NOT NULL,
  `salt` varchar(50) DEFAULT NULL,
  `disabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '用户是否禁用',
  `ip_address_signup` varchar(50) NOT NULL COMMENT '注册时ip',
  `ip_source_signup` varchar(100) NOT NULL COMMENT '注册ip所在地',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `qq` varchar(10) DEFAULT NULL,
  `nickname` varchar(50) NOT NULL,
  `avatar` varchar(250) DEFAULT NULL,
  `signature` varchar(100) DEFAULT NULL,
  `website` varchar(100) DEFAULT NULL,
  `introduction` varchar(250) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3 COMMENT='用户账号';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_user_role`
--

DROP TABLE IF EXISTS `t_user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_user_role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户账号角色ID',
  `user_id` int NOT NULL COMMENT '用户账号ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户账号对应角色';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_visitor`
--

DROP TABLE IF EXISTS `t_visitor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_visitor` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '访客信息ID',
  `visitor_key` varchar(256) NOT NULL,
  `view_type` varchar(20) NOT NULL COMMENT 'ip地址',
  `view_id` int DEFAULT NULL COMMENT 'ip所在地',
  `ip_address` varchar(100) NOT NULL COMMENT '访问用户的账号ID',
  `ip_source` varchar(100) NOT NULL COMMENT '访问用户的名称',
  `device` varchar(50) NOT NULL DEFAULT '未知设备',
  `browser` varchar(50) NOT NULL DEFAULT '未知浏览器',
  `point` point DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid_UNIQUE` (`visitor_key`)
) ENGINE=InnoDB AUTO_INCREMENT=4077 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='访客信息';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visit_statistics`
--

DROP TABLE IF EXISTS `visit_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_statistics` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `page_type` varchar(20) NOT NULL COMMENT '页面类型',
  `page_id` varchar(64) DEFAULT NULL COMMENT '页面ID',
  `statistics_date` datetime NOT NULL COMMENT '统计日期',
  `visit_count` bigint NOT NULL DEFAULT '0' COMMENT '访问量',
  `unique_visitor_count` bigint NOT NULL DEFAULT '0' COMMENT '独立访客数',
  `page_view_count` bigint NOT NULL DEFAULT '0' COMMENT '页面浏览量',
  `geo_statistics` text COMMENT '地理位置统计(JSON)',
  `device_statistics` text COMMENT '设备统计(JSON)',
  `browser_statistics` text COMMENT '浏览器统计(JSON)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_type_page_id_date` (`page_type`,`page_id`,`statistics_date`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_statistics_date` (`statistics_date`),
  KEY `idx_visit_count` (`visit_count`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='访问量统计表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visitor`
--

DROP TABLE IF EXISTS `visitor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '访客ID',
  `visitor_uuid` varchar(64) NOT NULL COMMENT '访客唯一标识',
  `ip_address` varchar(128) NOT NULL COMMENT 'IP地址',
  `first_visit_time` datetime NOT NULL COMMENT '首次访问时间',
  `last_visit_time` datetime NOT NULL COMMENT '最后访问时间',
  `visit_count` int NOT NULL DEFAULT '1' COMMENT '访问次数',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '访客状态',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `country` varchar(100) DEFAULT NULL COMMENT '国家',
  `province` varchar(100) DEFAULT NULL COMMENT '省份/州',
  `city` varchar(100) DEFAULT NULL COMMENT '城市',
  `district` varchar(100) DEFAULT NULL COMMENT '区/县',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `detailed_address` varchar(500) DEFAULT NULL COMMENT '详细地址',
  `isp` varchar(100) DEFAULT NULL COMMENT 'ISP运营商',
  `timezone` varchar(50) DEFAULT NULL COMMENT '时区',
  `device_type` varchar(50) DEFAULT NULL COMMENT '设备类型',
  `device_brand` varchar(50) DEFAULT NULL COMMENT '设备品牌',
  `device_model` varchar(100) DEFAULT NULL COMMENT '设备型号',
  `os_name` varchar(50) DEFAULT NULL COMMENT '操作系统名称',
  `os_version` varchar(50) DEFAULT NULL COMMENT '操作系统版本',
  `browser_name` varchar(50) DEFAULT NULL COMMENT '浏览器名称',
  `browser_version` varchar(50) DEFAULT NULL COMMENT '浏览器版本',
  `traffic_source` varchar(50) DEFAULT NULL COMMENT '流量来源分类',
  `referer_url` varchar(500) DEFAULT NULL COMMENT '来源页面URL',
  `search_engine` varchar(50) DEFAULT NULL COMMENT '搜索引擎名称',
  `search_keywords` varchar(200) DEFAULT NULL COMMENT '搜索关键词',
  `utm_source` varchar(100) DEFAULT NULL COMMENT 'UTM来源参数',
  `utm_medium` varchar(100) DEFAULT NULL COMMENT 'UTM媒介参数',
  `utm_campaign` varchar(100) DEFAULT NULL COMMENT 'UTM活动参数',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_visitor_uuid` (`visitor_uuid`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_first_visit_time` (`first_visit_time`),
  KEY `idx_last_visit_time` (`last_visit_time`),
  KEY `idx_status` (`status`),
  KEY `idx_country` (`country`),
  KEY `idx_city` (`city`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='访客记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visitor_access_log`
--

DROP TABLE IF EXISTS `visitor_access_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_access_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '访问记录ID',
  `visitor_id` int NOT NULL COMMENT '访客ID',
  `visitor_uuid` varchar(64) NOT NULL COMMENT '访客唯一标识',
  `ip_address` varchar(128) NOT NULL COMMENT 'IP地址',
  `page_type` varchar(20) NOT NULL COMMENT '页面类型',
  `page_id` varchar(64) DEFAULT NULL COMMENT '页面ID',
  `page_url` varchar(500) DEFAULT NULL COMMENT '页面URL',
  `referer` varchar(500) DEFAULT NULL COMMENT '来源页面URL',
  `session_id` varchar(64) DEFAULT NULL COMMENT '会话ID',
  `is_new_visitor` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为新访客',
  `is_page_view` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否为页面浏览',
  `access_time` datetime NOT NULL COMMENT '访问时间',
  `traffic_source` varchar(20) DEFAULT 'UNKNOWN' COMMENT '流量来源分类',
  `referer_url` varchar(500) DEFAULT NULL COMMENT '来源页面URL',
  `search_engine` varchar(50) DEFAULT NULL COMMENT '搜索引擎名称',
  `search_keywords` varchar(200) DEFAULT NULL COMMENT '搜索关键词',
  `utm_source` varchar(100) DEFAULT NULL COMMENT 'UTM来源参数',
  `utm_medium` varchar(100) DEFAULT NULL COMMENT 'UTM媒介参数',
  `utm_campaign` varchar(100) DEFAULT NULL COMMENT 'UTM活动参数',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  PRIMARY KEY (`id`),
  KEY `idx_visitor_id` (`visitor_id`),
  KEY `idx_visitor_uuid` (`visitor_uuid`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_access_time` (`access_time`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_access_log_traffic_source` (`traffic_source`),
  KEY `idx_access_log_traffic_date` (`traffic_source`,`access_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='访客访问记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'blog'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-18 14:52:15
