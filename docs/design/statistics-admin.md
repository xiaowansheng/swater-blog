# 统计后台设计

## 1. 目标
为后台管理端提供“访客/会话/页面 PV/内容指标趋势（阅读/点赞/评论）”相关的统计查询能力。

本设计覆盖：
- **总览**（UV / 新访客 / 会话数 / PV / 人均页数等）
- **趋势图**（按天聚合）
- **Top 页面**（PV、UV、会话数）
- **内容指标趋势**（阅读/点赞/评论，基于事件表增量）

## 2. 指标口径（统一定义）
> 与 `docs/design/visitor-tracking-v2.md` 的会话与去重逻辑一致（只是命名不再带 v2）。

### 2.1 UV（访客数）
- UV = 时间范围内有过页面 PV 的不同访客数
- 计算：`count(distinct page_view.visitor_id)`（按 `page_view.occurred_at` 过滤）

### 2.2 新访客数（New UV）
- 新访客 = 时间范围内首次出现的访客数
- 计算：`count(*) from visitor where first_visit_time in range`

### 2.3 会话数（Sessions / 网站访问量）
- 会话数 = 时间范围内新建会话的数量
- 计算：`count(*) from visitor_session where started_at in range`

### 2.4 PV（页面浏览量）
- PV = 时间范围内写入的 `page_view` 行数
- 计算：`count(*) from page_view where occurred_at in range`
- 去重规则：同一 `(visitor_id, session_id, page_key)` 只会产生 1 条 `page_view`

### 2.5 人均页数（Pages / Session）
- `pagesPerSession = PV / Sessions`（Sessions 为 0 时返回 0）

### 2.6 内容指标趋势（阅读/点赞/评论）
内容累计值（`article/talk` 表上的 `view_count/like_count/comment_count`）只能说明“当前累计”，无法可靠还原每天增量。

因此采用“事件表”记录增量：
- READ：当 24h 去重判定通过并成功 `view_count + 1` 时写入 delta=+1
- LIKE：点赞/取消点赞成功后写入 delta=+1/-1
- COMMENT：评论审核通过/删除/可见性变更导致统计变化时写入 delta=+1/-1

## 3. 数据模型

### 3.1 直接查询依赖表（已存在）
- `visitor`
- `visitor_session`
- `page_view`
- `article` / `talk`

### 3.2 新增：通用内容指标事件表
用于趋势/Top 内容统计，**不影响展示累计值**。

```sql
CREATE TABLE content_metric_event (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  visitor_id BIGINT NULL,
  metric VARCHAR(16) NOT NULL, -- READ/LIKE/COMMENT
  content_type VARCHAR(16) NOT NULL, -- ARTICLE/TALK
  content_id BIGINT NOT NULL,
  delta INT NOT NULL,
  occurred_at DATETIME NOT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_time (occurred_at),
  KEY idx_metric_time (metric, occurred_at),
  KEY idx_content_metric_time (content_type, content_id, metric, occurred_at),
  KEY idx_visitor_time (visitor_id, occurred_at),
  KEY idx_deleted (deleted)
);
```

## 4. 后台接口设计（Admin API）
统一前缀：`/api/admin/statistics`

### 4.1 总览
`GET /api/admin/statistics/overview?start=...&end=...`

返回：
- `uv/newUv/sessions/pv/pagesPerSession`
- `articleReads/talkReads/...`（READ 事件 sum）
- `articleLikes/talkLikes/...`（LIKE 事件 sum）
- `articleComments/talkComments/...`（COMMENT 事件 sum）

### 4.2 趋势（按天）
`GET /api/admin/statistics/trend/daily?metric=pv&start=...&end=...`

`metric` 建议枚举：
- `pv | uv | sessions | newUv`
- `articleReads | talkReads`
- `articleLikes | talkLikes`
- `articleComments | talkComments`

### 4.3 Top 页面
`GET /api/admin/statistics/pages/top?start=...&end=...&limit=20&orderBy=pv`

`orderBy`：`pv | uv | sessions`

