-- 友链表
DROP TABLE IF EXISTS `friend_link`;
CREATE TABLE `friend_link` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '友情链接ID',
  `name` VARCHAR(100) NOT NULL COMMENT '友链名称',
  `url` VARCHAR(255) NOT NULL COMMENT '链接地址',
  `logo` VARCHAR(255) DEFAULT NULL COMMENT 'Logo',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `author` VARCHAR(30) DEFAULT NULL COMMENT '网站作者',
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
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='友情链接表';

