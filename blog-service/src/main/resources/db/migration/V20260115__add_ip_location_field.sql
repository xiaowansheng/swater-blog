-- 添加 IP 解析地址字段
-- 执行日期: 2025-01-15
-- 说明: 为 comment、guestbook 和 talk 表添加 ip_location 字段，存储从 IP 解析的完整地址
--      location 字段存储从经纬度解析的地址，ip_location 存储 IP 解析的地址

-- 为评论表添加 ip_location 字段
ALTER TABLE `comment`
ADD COLUMN `ip_location` VARCHAR(255) DEFAULT NULL
COMMENT 'IP解析的完整地址（如：中国广东广州）'
AFTER `location`;

-- 为留言表添加 ip_location 字段
ALTER TABLE `guestbook`
ADD COLUMN `ip_location` VARCHAR(255) DEFAULT NULL
COMMENT 'IP解析的完整地址（如：中国广东广州）'
AFTER `location`;

-- 为说说表添加 ip_location 字段
ALTER TABLE `talk`
ADD COLUMN `ip_location` VARCHAR(255) DEFAULT NULL
COMMENT 'IP解析的完整地址（如：中国广东广州）'
AFTER `location`;
