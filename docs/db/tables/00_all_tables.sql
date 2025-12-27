-- 数据库表结构汇总文件
-- 按顺序执行所有表结构定义
-- 注意：请确保按顺序执行，因为存在外键依赖关系

-- ============================================
-- 1. 文件相关表
-- ============================================
SOURCE 01_file_meta.sql;
SOURCE 02_file_reference.sql;

-- ============================================
-- 2. 用户权限相关表
-- ============================================
SOURCE 03_user.sql;
SOURCE 04_role.sql;
SOURCE 06_sys_api.sql;
SOURCE 07_role_api.sql;
SOURCE 21_sys_menu.sql;
SOURCE 22_role_menu.sql;

-- ============================================
-- 3. 内容相关表
-- ============================================
SOURCE 08_category.sql;
SOURCE 09_tag.sql;
SOURCE 10_article.sql;
SOURCE 11_article_tag.sql;
SOURCE 12_archive.sql;
SOURCE 13_talk.sql;
SOURCE 14_comment.sql;
SOURCE 15_friend_link.sql;
SOURCE 24_guestbook.sql;

-- ============================================
-- 4. 系统配置表
-- ============================================
SOURCE 16_sys_config.sql;
SOURCE 17_sys_notification.sql;

-- ============================================
-- 5. 访客统计相关表
-- ============================================
SOURCE 18_visitor.sql;
SOURCE 29_visit_statistics.sql;
SOURCE 30_visitor_access_log.sql;
SOURCE 31_visitor_old.sql;

-- ============================================
-- 6. 日志表
-- ============================================
SOURCE 19_log_operation.sql;
SOURCE 20_log_error.sql;

-- ============================================
-- 7. 扩展功能表
-- ============================================
SOURCE 26_album.sql;
SOURCE 27_picture.sql;
SOURCE 28_share_category.sql;

