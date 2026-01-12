-- ========================================
-- 访问追踪（V2）：会话 / 页面PV / 内容阅读
-- ========================================

-- 说说增加浏览数（用于 24h 阅读量计数）
ALTER TABLE `talk`
  ADD COLUMN `view_count` INT NOT NULL DEFAULT '0' COMMENT '浏览数' AFTER `comment_count`;

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

-- 内容点赞状态（严格防重复 + 支持取消赞）
CREATE TABLE IF NOT EXISTS `content_like_state` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '状态ID',
  `visitor_id` BIGINT NOT NULL COMMENT '访客ID',
  `content_type` VARCHAR(16) NOT NULL COMMENT '内容类型(ARTICLE/TALK)',
  `content_id` BIGINT NOT NULL COMMENT '内容ID',
  `liked` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否点赞(0否1是)',
  `last_changed_at` DATETIME NOT NULL COMMENT '最后变更时间',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_visitor_content` (`visitor_id`, `content_type`, `content_id`),
  KEY `idx_content` (`content_type`, `content_id`),
  KEY `idx_visitor` (`visitor_id`),
  KEY `idx_last_changed_at` (`last_changed_at`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容点赞状态';
