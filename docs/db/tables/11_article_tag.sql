-- 文章标签关联表
DROP TABLE IF EXISTS `article_tag`;
CREATE TABLE `article_tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文章和标签关联ID',
  `article_id` BIGINT NOT NULL COMMENT '文章ID',
  `tag_id` BIGINT NOT NULL COMMENT '标签ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_tag` (`article_id`,`tag_id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `fk_article_tag_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_article_tag_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章对应标签表';

