-- 访问量表
DROP TABLE IF EXISTS `page_view`;
CREATE TABLE `page_view` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '访问量ID',
  `count` BIGINT NOT NULL DEFAULT '0' COMMENT '访问量',
  `view_type` VARCHAR(20) NOT NULL COMMENT '访问量类型（1网站访问量2博客文章访问量3说说访问量4写作文章访问量5相册访问量6友链访问量）',
  `view_id` BIGINT DEFAULT NULL COMMENT '不同访问类型的对应表ID',
  `deleted` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否已删除',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_view_type` (`view_type`),
  KEY `idx_view_id` (`view_id`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访问量表';

