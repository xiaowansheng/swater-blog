# 数据库表结构文件

## 文件说明

每个表结构都保存在单独的文件中，文件命名规则：`序号_表名.sql`

## 表列表

### 核心业务表
1. `01_file_meta.sql` - 文件元数据表 (`file_meta`)
2. `02_file_reference.sql` - 文件引用关系表 (`file_reference`)
3. `03_user.sql` - 用户表 (`user`)
4. `04_role.sql` - 角色表 (`role`)
5. `05_user_role.sql` - 用户角色关联表 (`user_role`)
6. `06_sys_api.sql` - 接口资源表 (`sys_api`)
7. `07_role_api.sql` - 角色接口权限表 (`role_api`)
8. `08_category.sql` - 分类表 (`category`)
9. `09_tag.sql` - 标签表 (`tag`)
10. `10_article.sql` - 文章表 (`article`)
11. `11_article_tag.sql` - 文章标签关联表 (`article_tag`)
12. `12_archive.sql` - 归档表 (`archive`)
13. `13_talk.sql` - 说说表 (`talk`)
14. `14_comment.sql` - 评论表 (`comment`)
15. `15_friend_link.sql` - 友链表 (`friend_link`)
16. `16_sys_config.sql` - 配置表 (`sys_config`)
17. `17_sys_notification.sql` - 通知表 (`sys_notification`)
18. `18_visitor.sql` - 访客表 (`visitor`)
19. `19_log_operation.sql` - 操作日志表 (`log_operation`)
20. `20_log_error.sql` - 异常日志表 (`log_error`)

### 扩展表
21. `21_sys_menu.sql` - 菜单表 (`sys_menu`)
22. `22_role_menu.sql` - 角色菜单关联表 (`role_menu`)
23. `24_guestbook.sql` - 留言簿表 (`guestbook`)
24. `26_album.sql` - 相册表 (`album`)
25. `27_picture.sql` - 图片表 (`picture`)
26. `28_share_category.sql` - 分享分类表 (`share_category`)
27. `29_visit_statistics.sql` - 访问统计表 (`visit_statistics`)
28. `30_visitor_access_log.sql` - 访客访问记录表 (`visitor_access_log`)
31. `31_visitor_old.sql` - 旧版访客信息表 (`visitor_old`)

## 使用说明

### 按顺序执行

按照文件序号顺序执行SQL文件，确保外键约束正确。

### 批量执行

可以使用以下命令批量执行：

```bash
# MySQL命令行（按顺序执行）
mysql -u root -p blog < 01_file_meta.sql
mysql -u root -p blog < 02_file_reference.sql
mysql -u root -p blog < 03_user.sql
mysql -u root -p blog < 04_role.sql
# ... 依次执行所有文件

# 或使用汇总文件一次性执行
mysql -u root -p blog < 00_all_tables.sql
```

### 注意事项

1. 所有表使用 `utf8mb4` 字符集和 `utf8mb4_unicode_ci` 排序规则
2. 所有业务表包含 `deleted` 字段用于逻辑删除
3. 所有业务表包含 `create_time` 和 `update_time` 字段
4. ID字段统一使用 `BIGINT` 类型
5. 外键约束已添加，删除时会级联处理

## 表命名规范

- ✅ 去掉不必要的 `t_` 前缀
- ✅ 系统表使用 `sys_` 前缀（sys_api, sys_config, sys_notification, sys_menu）
- ✅ 日志表使用 `log_` 前缀（log_operation, log_error）
- ✅ 关联表使用清晰的后缀（user_role, article_tag, role_api, role_menu）
- ✅ 业务表使用单数形式（user, role, article, comment等）

## 完善内容

- ✅ 统一字符集为 utf8mb4_unicode_ci
- ✅ 统一ID字段类型为 BIGINT
- ✅ 添加缺失字段（如文章表的slug、excerpt、view_count等）
- ✅ 完善索引设计
- ✅ 添加外键约束
- ✅ 统一字段命名规范
- ✅ 优化表命名规范
- ✅ 添加归档表

