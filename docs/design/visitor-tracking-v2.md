# 访客/会话/页面 PV/内容阅读统计系统（V2 设计）

## 1. 背景与目标
本设计用于替换旧版统计口径与实现，不保证兼容旧表/旧接口，可新增/调整任意表结构。

### 1.1 业务口径（最终定义）
**访客（Visitor / 用户数）**
- 以 `visitor_uuid` 为唯一访客标识。
- `visitor_uuid` 不变则永远视为同一访客（用户数=1），与会话无关。

**会话（Session，30 分钟）**
- 对同一访客：距离“该访客上一次任意页面访问时间”超过 30 分钟，则开启新会话；否则属于同一会话。
- 会话是站点级（全站共用），不是页面级。

**网站访问量（Site Visit）**
- 每创建一个新会话，网站访问量 +1。

**页面浏览量（Page PV，会话内同页一次）**
- 同一会话内，同一页面（由 `page_key` 标识）只计 1 次 PV。
- 新会话再次访问同一页面，则 PV 可再次 +1。

**内容阅读量（Content Read，24 小时访客去重）**
- 针对文章/说说：同一访客 `visitor_uuid` 在 24 小时内对同一内容只计 1 次阅读量。
- 超过 24 小时再次访问同一内容，则阅读量再次 +1。
- 阅读量与页面 PV 分离：内容阅读更“克制”，页面PV更“行为”。

### 1.2 非目标
- 不要求兼容旧表/旧字段/旧聚合逻辑。
- 不在本设计中实现停留时长、滚动深度、跳出率等高级分析（可留扩展位）。

## 2. 总体架构
前端：只负责上报“发生了一次页面进入/内容进入”，并携带 `visitor_uuid`（本地持久化）。

后端：负责
1) 访客识别/创建  
2) 会话判定（30min）  
3) 页面 PV 去重（session+page）  
4) 内容阅读去重（visitor+content，24h）  
5) 落库与查询

## 3. 标识与枚举
### 3.1 访客标识
- `visitor_uuid`：前端生成 UUID v4，写入 `localStorage`，跨会话长期有效。

### 3.2 页面标识（Page Key）
统一用 `page_key`（字符串）表示页面“去重主键”，建议采用：
- 文章详情：`ARTICLE:{articleId}`
- 说说详情：`TALK:{talkId}`
- 普通页面：`PAGE:{normalizedPath}`（默认不含 query；或 query 仅保留白名单参数）

> 不建议用完整 URL（含 query）当 `page_key`，会导致 PV 被参数拆分。

### 3.3 内容标识
- `content_type`：`ARTICLE` | `TALK`
- `content_id`：BIGINT（文章/说说主键 ID）

## 4. 数据模型（MySQL 示例 DDL）
> 可按实际引擎/分区策略调整；这里以 InnoDB 为基础。

### 4.1 访客表：`visitor`
```sql
CREATE TABLE visitor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  visitor_uuid VARCHAR(64) NOT NULL,
  first_seen_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,

  ip VARCHAR(128) NULL,
  user_agent VARCHAR(500) NULL,

  country VARCHAR(64) NULL,
  province VARCHAR(64) NULL,
  city VARCHAR(64) NULL,
  isp VARCHAR(128) NULL,

  device_type VARCHAR(32) NULL,
  device_brand VARCHAR(64) NULL,
  device_model VARCHAR(128) NULL,
  os_name VARCHAR(64) NULL,
  os_version VARCHAR(64) NULL,
  browser_name VARCHAR(64) NULL,
  browser_version VARCHAR(64) NULL,

  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_visitor_uuid (visitor_uuid),
  KEY idx_last_seen_at (last_seen_at)
);
```

### 4.2 会话表：`visitor_session`
用于定义“网站访问量 = 会话数”。
```sql
CREATE TABLE visitor_session (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  visitor_id BIGINT NOT NULL,
  session_id VARCHAR(64) NOT NULL,

  started_at DATETIME NOT NULL,
  last_activity_at DATETIME NOT NULL,

  entry_page_key VARCHAR(300) NULL,
  entry_referer VARCHAR(500) NULL,
  utm_source VARCHAR(100) NULL,
  utm_medium VARCHAR(100) NULL,
  utm_campaign VARCHAR(100) NULL,

  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_visitor_session (visitor_id, session_id),
  KEY idx_visitor_last_activity (visitor_id, last_activity_at),
  KEY idx_started_at (started_at)
);
```

### 4.3 页面 PV 去重表：`page_view`
每条代表一次“会话内该页面首次 PV”，天然满足去重与计数。
```sql
CREATE TABLE page_view (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  visitor_id BIGINT NOT NULL,
  session_id VARCHAR(64) NOT NULL,

  page_key VARCHAR(300) NOT NULL,
  page_url VARCHAR(800) NULL,
  referer VARCHAR(500) NULL,

  occurred_at DATETIME NOT NULL,

  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uk_session_page (visitor_id, session_id, page_key),
  KEY idx_occurred_at (occurred_at),
  KEY idx_page_key_time (page_key, occurred_at)
);
```

### 4.4 内容阅读去重表：`content_read`
每条记录该访客对该内容的“最后一次计数时间”，实现滚动 24h 去重。
```sql
CREATE TABLE content_read (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  visitor_id BIGINT NOT NULL,

  content_type VARCHAR(16) NOT NULL,
  content_id BIGINT NOT NULL,

  last_counted_at DATETIME NOT NULL,

  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_visitor_content (visitor_id, content_type, content_id),
  KEY idx_last_counted_at (last_counted_at)
);
```

### 4.5 可选：事件明细 `track_event`
不参与计数，仅用于回放与排障，可按需开启。
```sql
CREATE TABLE track_event (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  visitor_id BIGINT NULL,
  session_id VARCHAR(64) NULL,

  event_type VARCHAR(32) NOT NULL,
  page_key VARCHAR(300) NULL,
  payload_json JSON NULL,

  occurred_at DATETIME NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_time (occurred_at),
  KEY idx_visitor_time (visitor_id, occurred_at)
);
```

## 5. 接口设计（Public API）
### 5.1 `POST /api/public/track/enter`
用于页面进入（包括内容页），后端统一完成：访客识别、会话判定、PV 去重、阅读去重。

**Request JSON**
```json
{
  "visitorUuid": "uuid-v4",
  "pageKey": "ARTICLE:123",
  "pageUrl": "https://site/zh/post/xxx",
  "referer": "https://google.com/...",
  "utmSource": "xxx",
  "utmMedium": "xxx",
  "utmCampaign": "xxx",
  "contentType": "ARTICLE",
  "contentId": 123
}
```

**Response JSON**
```json
{
  "visitorUuid": "uuid-v4-final",
  "sessionId": "server-session-id",
  "newVisitor": true,
  "newSession": true,
  "pagePvCounted": true,
  "contentReadCounted": true
}
```

## 6. 后端核心流程（伪代码）
### 6.1 访客识别（用户数口径）
```
visitor = findByVisitorUuid(req.visitorUuid)
if not exists:
  visitor = create(visitor_uuid=uuid or server_generated)
newVisitor = created
update visitor.last_seen_at = now
```

### 6.2 会话判定（30 分钟）
```
lastSession = findLatestSession(visitor.id)

if lastSession not exists OR now - lastSession.last_activity_at > 30m:
  session = createNewSession(visitor.id, new session_id)
  newSession = true
else:
  session = lastSession
  newSession = false

update session.last_activity_at = now
```

### 6.3 页面 PV 计数（会话内同页一次）
```
insert page_view unique(visitor_id, session_id, page_key)
if insert success: pagePvCounted = true
else: pagePvCounted = false
```

### 6.4 内容阅读计数（24 小时去重）
```
if contentType/contentId provided:
  row = select content_read where (visitor_id, content_type, content_id)

  if not exists:
     insert row(last_counted_at=now)
     contentReadCounted = true
  else if now - row.last_counted_at > 24h:
     update row.last_counted_at = now
     contentReadCounted = true
  else:
     contentReadCounted = false

  if contentReadCounted:
     if contentType=ARTICLE: article.view_count += 1
     if contentType=TALK: talk.view_count += 1 (若无字段则新增)
```

## 7. 报表口径（Admin）
- 总访客数：`count(visitor)`
- 网站访问量（会话数）：`count(visitor_session)`（可按 `started_at` 聚合）
- 页面 PV：`count(page_view)` 或按 `page_key` 分组
- 文章/说说阅读量：读内容表 `view_count`（若采用原子自增），或按 `content_read` 的“计数触发”做补充统计

## 8. 索引与性能建议
- `page_view` 的唯一键是核心：`(visitor_id, session_id, page_key)`，插入冲突即去重。
- `content_read` 的唯一键是核心：`(visitor_id, content_type, content_id)`，更新判断 24h。
- `visitor_session` 按 `(visitor_id, last_activity_at)` 快速查最后会话。
- 内容阅读自增用 SQL 原子更新：`update ... set view_count=view_count+1 where id=?`

## 9. 前端约束（必须满足）
- 永远携带 `visitorUuid`（localStorage）。
- `pageKey` 采用后端可解析/可聚合的规范形式（推荐 `TYPE:ID`）。
- 内容页必须传 `contentType/contentId`（不要只传 slug/key），否则无法做阅读量精确计数。

