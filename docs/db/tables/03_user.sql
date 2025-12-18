-- 用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
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
  `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色',
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

