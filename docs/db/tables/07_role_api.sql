-- 角色接口权限表
DROP TABLE IF EXISTS `role_api`;
CREATE TABLE `role_api` (
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `api_id` BIGINT NOT NULL COMMENT '资源ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_role_api` (`role_id`,`api_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_api_id` (`api_id`),
  CONSTRAINT `fk_role_api_role_id` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_api_api_id` FOREIGN KEY (`api_id`) REFERENCES `sys_api` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色接口权限表';

