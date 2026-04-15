# 语雀同步工具 - 设计文档

## 1. 项目概述

### 1.1 功能目标

创建一个独立的语雀同步工具，实现以下核心功能：

1. **从语雀导入文章** - 将语雀知识库的文章导入到博客数据库
2. **导出文章到语雀** - 将博客文章发布到语雀知识库
3. **双向同步** - 博客文章与语雀文章的智能双向同步
4. **灵活配置** - 支持数据库表和字段的映射配置

### 1.2 技术栈

- **语言**: Node.js / TypeScript
- **数据库**: MySQL (使用现有博客数据库)
- **HTTP客户端**: axios
- **CLI框架**: commander.js
- **配置管理**: cosmiconfig (支持 .json/.yaml/.js)
- **日志**: winston
- **数据库ORM**: Prisma (基于现有数据库)

## 2. 语雀API分析

根据语雀OpenAPI文档（v2.0.1），关键接口如下：

### 2.1 核心API接口

| 功能 | HTTP方法 | 路径 | 说明 |
|------|---------|------|------|
| 获取文档列表 | GET | `/api/v2/repos/{book_id}/docs` | 获取知识库的所有文档 |
| 获取文档详情 | GET | `/api/v2/repos/docs/{id}` | 获取文档完整内容 |
| 创建文档 | POST | `/api/v2/repos/{book_id}/docs` | 创建新文档 |
| 更新文档 | PUT | `/api/v2/repos/{book_id}/docs/{id}` | 更新文档 |
| 删除文档 | DELETE | `/api/v2/repos/{book_id}/docs/{id}` | 删除文档 |
| 获取知识库目录 | GET | `/api/v2/repos/{book_id}/toc` | 获取目录树结构 |
| 更新知识库目录 | PUT | `/api/v2/repos/{book_id}/toc` | 更新目录结构 |

**认证方式**: Header `X-Auth-Token: <your_token>`

### 2.2 语雀文档数据结构 (V2DocDetail)

```typescript
interface YuqueDoc {
  id: number;                  // 文档ID
  type: 'Doc' | 'Sheet';       // 文档类型
  slug: string;                // 路径
  title: string;               // 标题
  description: string;         // 摘要
  cover: string;               // 封面图URL
  format: 'markdown' | 'lake' | 'html';  // 内容格式
  body: string;                // 正文原始内容 (根据format不同而不同)
  body_html: string;           // HTML格式内容
  body_draft: string;          // 草稿内容
  user_id: number;             // 创建者ID
  book_id: number;             // 知识库ID
  public: 0 | 1 | 2;           // 公开性 (0:私密, 1:公开, 2:企业内公开)
  status: string;              // 状态 (0:草稿, 1:发布)
  created_at: string;          // 创建时间 (ISO 8601)
  updated_at: string;          // 更新时间 (ISO 8601)
  published_at: string;        // 发布时间 (ISO 8601)
  word_count: number;          // 字数
  likes_count: number;         // 点赞数
  comments_count: number;      // 评论数
  tags?: V2Tag[];              // 标签数组
}
```

## 3. 博客数据库结构

### 3.1 核心表结构

基于现有的 schema.sql，相关表如下：

```sql
-- 文章表
CREATE TABLE `article` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `article_key` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255),
  `content` LONGTEXT NOT NULL,
  `excerpt` TEXT,
  `cover` VARCHAR(512),
  `author_id` BIGINT,
  `category_id` BIGINT,
  `status` TINYINT(1) DEFAULT 0,  -- 0:草稿, 1:已发布, 2:私密
  `type` VARCHAR(20) DEFAULT '1',  -- 1:原创, 2:转载, 3:翻译
  `published_at` DATETIME,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_key` (`article_key`)
);

-- 分类表
CREATE TABLE `category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `category_key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(100),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_key` (`category_key`)
);

-- 标签表
CREATE TABLE `tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tag_key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(100),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_key` (`tag_key`)
);

-- 文章标签关联表
CREATE TABLE `article_tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT NOT NULL,
  `tag_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_tag` (`article_id`, `tag_id`)
);
```

### 3.2 新增同步相关表

```sql
-- 语雀文章映射表
CREATE TABLE `yuque_article_mapping` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `article_id` BIGINT NOT NULL COMMENT '博客文章ID',
  `doc_id` BIGINT NOT NULL COMMENT '语雀文档ID',
  `doc_slug` VARCHAR(255) COMMENT '语雀文档路径',
  `book_id` BIGINT COMMENT '语雀知识库ID',
  `sync_direction` VARCHAR(20) COMMENT '最后同步方向(yuque_to_blog/blog_to_yuque/bidirectional)',
  `last_sync_time` DATETIME COMMENT '最后同步时间',
  `sync_count` INT DEFAULT 0 COMMENT '同步次数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_id` (`article_id`),
  UNIQUE KEY `uk_doc_id` (`doc_id`),
  KEY `idx_book_id` (`book_id`),
  KEY `idx_last_sync_time` (`last_sync_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语雀文章映射表';

-- 语雀同步日志表
CREATE TABLE `yuque_sync_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `article_id` BIGINT COMMENT '博客文章ID',
  `doc_id` BIGINT COMMENT '语雀文档ID',
  `sync_type` VARCHAR(20) NOT NULL COMMENT '同步类型(import/export/sync)',
  `sync_direction` VARCHAR(20) NOT NULL COMMENT '同步方向',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态(pending/success/failed)',
  `error_message` TEXT COMMENT '错误信息',
  `metadata` JSON COMMENT '同步元数据',
  `sync_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_doc_id` (`doc_id`),
  KEY `idx_sync_type` (`sync_type`),
  KEY `idx_status` (`status`),
  KEY `idx_sync_time` (`sync_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='语雀同步日志表';
```

## 4. 字段映射设计

### 4.1 默认映射规则

| 博客字段 | 语雀字段 | 数据类型 | 转换规则 | 说明 |
|---------|---------|---------|---------|------|
| title | title | string | 直接映射 | 文章标题 |
| content | body | longtext | 格式转换 | Markdown/HTML转换 |
| excerpt | description | text | 截取前200字符 | 文章摘要 |
| slug | slug | string | URL编码友好 | 文章别名 |
| cover | cover | varchar(512) | 直接映射 | 封面图片URL |
| status | status | tinyint | 0/1→0/1 | 草稿/发布状态 |
| published_at | published_at | datetime | ISO8601转换 | 发布时间 |
| created_at | created_at | datetime | ISO8601转换 | 创建时间 |
| updated_at | updated_at | datetime | ISO8601转换 | 更新时间 |

### 4.2 扩展字段映射 (可选)

| 博客字段 | 语雀字段 | 转换规则 |
|---------|---------|---------|
| word_count | word_count | 直接映射 |
| view_count | read_count | 直接映射 |
| like_count | likes_count | 直接映射 |
| comment_count | comments_count | 直接映射 |

### 4.3 标签映射

- **语雀**: `tags` 数组，每个tag包含 `id` 和 `title`
- **博客**: 需要查询或创建 `tag` 表记录
- **策略**:
  1. 根据tag title查询或创建对应博客tag
  2. 在 `article_tag` 表中创建关联

### 4.4 分类映射

由于语雀没有"分类"概念，提供以下策略：

**策略1: 基于知识库映射**
```javascript
{
  "categoryMapping": {
    "book_id_1": "技术",
    "book_id_2": "生活",
    "book_id_3": "笔记"
  }
}
```

**策略2: 基于目录路径映射**
```javascript
{
  "categoryMapping": {
    "/前端/": "前端开发",
    "/后端/": "后端开发",
    "/数据库/": "数据库"
  }
}
```

**策略3: 从文档标题解析**
```javascript
{
  "categoryPattern": "\\[(.*?)\\] · "  // 从 [分类] · 标题 中提取
}
```

## 5. 配置文件设计

### 5.1 配置文件结构

```yaml
# yuque-sync.config.yaml

# 语雀配置
yuque:
  token: "your_yuque_token"           # 语雀API Token
  baseUrl: "https://www.yuque.com/api/v2"
  namespace: "group/repo"             # 知识库路径

# 数据库配置
database:
  type: "mysql"
  host: "localhost"
  port: 3306
  database: "blog"
  username: "root"
  password: "password"

# 字段映射配置
mapping:
  # 文章映射
  article:
    table: "article"
    fields:
      title:
        source: "title"
        required: true
      content:
        source: "body"
        format: "markdown"  # markdown | html | lake
        transform: "sanitizeMarkdown"
      excerpt:
        source: "description"
        transform: "truncate:200"
      slug:
        source: "slug"
        transform: "slugify"
      cover:
        source: "cover"
      status:
        source: "status"
        map:
          "0": 0  # 草稿→草稿
          "1": 1  # 发布→发布
      published_at:
        source: "published_at"
        transform: "parseISO8601"

  # 分类映射
  category:
    table: "category"
    strategy: "book"  # book | path | pattern | none
    mapping:
      book:
        "123456": "技术文章"
        "789012": "生活随笔"
    createIfNotExist: true

  # 标签映射
  tag:
    table: "tag"
    source: "tags"
    nameField: "title"
    createIfNotExist: true

# 同步配置
sync:
  format: "markdown"              # 导出时的内容格式
  conflictStrategy: "skip"       # skip | overwrite | merge | ask
  autoPublish: false             # 自动发布文章
  downloadImages: true           # 下载图片到本地
  imageStoragePath: "/uploads/yuque"
  batchSize: 10                  # 批量操作大小
  delayBetweenRequests: 1000     # 请求间隔(ms)

# 过滤规则
filters:
  includeDrafts: false           # 是否包含草稿
  includeTypes: ["Doc"]          # 包含的文档类型
  excludeSlugs: []               # 排除的文档路径
  dateRange:                     # 日期范围
    start: null
    end: null

# 日志配置
logging:
  level: "info"                  # debug | info | warn | error
  file: "logs/yuque-sync.log"
  console: true
```

### 5.2 环境变量支持

```bash
YUQUE_TOKEN=your_token
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=blog
DB_USERNAME=root
DB_PASSWORD=password
```

## 6. 核心模块设计

### 6.1 项目结构

```
yuque-sync/
├── src/
│   ├── core/                   # 核心业务逻辑
│   │   ├── YuqueClient.ts     # 语雀API客户端
│   │   ├── BlogClient.ts      # 博客数据库客户端
│   │   ├── FieldMapper.ts     # 字段映射器
│   │   ├── ContentTransformer.ts  # 内容转换器
│   │   ├── SyncEngine.ts      # 同步引擎
│   │   └── ConflictResolver.ts    # 冲突解决器
│   ├── services/               # 业务服务层
│   │   ├── ImportService.ts   # 导入服务
│   │   ├── ExportService.ts   # 导出服务
│   │   ├── SyncService.ts     # 同步服务
│   │   └── MappingService.ts  # 映射服务
│   ├── models/                 # 数据模型
│   │   ├── YuqueDoc.ts        # 语雀文档模型
│   │   ├── BlogArticle.ts     # 博客文章模型
│   │   ├── Mapping.ts         # 映射关系模型
│   │   └── SyncLog.ts         # 同步日志模型
│   ├── utils/                  # 工具函数
│   │   ├── logger.ts          # 日志工具
│   │   ├── config.ts          # 配置加载
│   │   ├── date.ts            # 日期处理
│   │   ├── markdown.ts        # Markdown处理
│   │   └── validator.ts       # 数据验证
│   ├── cli/                    # CLI命令
│   │   ├── index.ts           # CLI入口
│   │   ├── import.ts          # 导入命令
│   │   ├── export.ts          # 导出命令
│   │   ├── sync.ts            # 同步命令
│   │   └── status.ts          # 状态命令
│   └── index.ts                # 程序入口
├── config/                      # 配置文件
│   ├── yuque-sync.config.yaml
│   └── yuque-sync.config.example.yaml
├── db/                          # 数据库相关
│   ├── schema.prisma           # Prisma Schema
│   └── migrations/             # 数据库迁移文件
├── logs/                        # 日志目录
├── tests/                       # 测试文件
├── package.json
├── tsconfig.json
└── README.md
```

### 6.2 YuqueClient - 语雀API客户端

```typescript
class YuqueClient {
  constructor(config: YuqueConfig) {}

  // 获取文档列表
  async getDocs(bookId: string, options?: ListOptions): Promise<YuqueDoc[]>

  // 获取文档详情
  async getDoc(docId: string, options?: DetailOptions): Promise<YuqueDocDetail>

  // 创建文档
  async createDoc(bookId: string, data: CreateDocData): Promise<YuqueDocDetail>

  // 更新文档
  async updateDoc(docId: string, data: UpdateDocData): Promise<YuqueDocDetail>

  // 删除文档
  async deleteDoc(docId: string): Promise<void>

  // 获取知识库目录
  async getTOC(bookId: string): Promise<TOCNode[]>

  // 更新知识库目录
  async updateTOC(bookId: string, tocData: TOCUpdate): Promise<void>
}
```

### 6.3 BlogClient - 博客数据库客户端

```typescript
class BlogClient {
  constructor(config: DatabaseConfig) {}

  // 根据ID获取文章
  async getArticleById(id: number): Promise<BlogArticle | null>

  // 根据slug获取文章
  async getArticleBySlug(slug: string): Promise<BlogArticle | null>

  // 创建文章
  async createArticle(data: CreateArticleData): Promise<BlogArticle>

  // 更新文章
  async updateArticle(id: number, data: UpdateArticleData): Promise<BlogArticle>

  // 删除文章
  async deleteArticle(id: number): Promise<void>

  // 获取或创建分类
  async getOrCreateCategory(name: string): Promise<Category>

  // 获取或创建标签
  async getOrCreateTag(name: string): Promise<Tag>

  // 关联文章标签
  async attachArticleTags(articleId: number, tags: Tag[]): Promise<void>

  // 创建映射关系
  async createMapping(mapping: Mapping): Promise<void>

  // 获取映射关系
  async getMappingByArticleId(articleId: number): Promise<Mapping | null>
  async getMappingByDocId(docId: number): Promise<Mapping | null>

  // 记录同步日志
  async logSync(log: SyncLog): Promise<void>
}
```

### 6.4 FieldMapper - 字段映射器

```typescript
class FieldMapper {
  constructor(config: MappingConfig) {}

  // 语雀文档 → 博客文章
  yuqueToBlog(yuqueDoc: YuqueDocDetail): BlogArticleData

  // 博客文章 → 语雀文档
  blogToYuque(article: BlogArticle): CreateDocData | UpdateDocData

  // 应用字段转换
  applyTransform(value: any, transform: string): any

  // 处理分类映射
  mapCategory(yuqueDoc: YuqueDocDetail): Promise<Category | null>

  // 处理标签映射
  mapTags(yuqueDoc: YuqueDocDetail): Promise<Tag[]>
}
```

### 6.5 ContentTransformer - 内容转换器

```typescript
class ContentTransformer {
  // Markdown → HTML
  markdownToHtml(markdown: string): string

  // HTML → Markdown
  htmlToMarkdown(html: string): string

  // Lake → Markdown
  lakeToMarkdown(lake: string): string

  // 清理Markdown
  sanitizeMarkdown(markdown: string): string

  // 处理图片URL
  processImages(content: string, strategy: ImageStrategy): Promise<string>

  // 提取摘要
  extractExcerpt(content: string, length: number): string
}
```

### 6.6 SyncEngine - 同步引擎

```typescript
class SyncEngine {
  constructor(
    yuqueClient: YuqueClient,
    blogClient: BlogClient,
    fieldMapper: FieldMapper
  ) {}

  // 从语雀导入
  async importFromYuque(options: ImportOptions): Promise<ImportResult>

  // 导出到语雀
  async exportToYuque(options: ExportOptions): Promise<ExportResult>

  // 双向同步
  async sync(options: SyncOptions): Promise<SyncResult>

  // 冲突检测
  detectConflict(article: BlogArticle, doc: YuqueDocDetail): Conflict | null

  // 冲突解决
  async resolveConflict(conflict: Conflict, strategy: string): Promise<void>
}
```

## 7. CLI命令设计

### 7.1 命令结构

```bash
yuque-sync <command> [options]

Commands:
  import       从语雀导入文章到博客
  export       从博客导出文章到语雀
  sync         双向同步文章
  status       查看同步状态
  config       管理配置文件
  mapping      管理映射关系

Options:
  -h, --help   显示帮助信息
  -v, --version  显示版本信息
  -c, --config <file>  指定配置文件
  -d, --debug  启用调试模式
```

### 7.2 导入命令

```bash
# 从语雀导入所有文章
yuque-sync import --all

# 导入指定文档
yuque-sync import --doc-id 123456

# 导入指定知识库的文章
yuque-sync import --book-id 789012

# 增量导入（仅导入新增和更新的）
yuque-sync import --incremental

# 导入并指定分类
yuque-sync import --all --category "技术文章"

# 导入但保存为草稿
yuque-sync import --all --draft

# 预览导入（不实际执行）
yuque-sync import --all --dry-run

# 详细输出
yuque-sync import --all --verbose
```

### 7.3 导出命令

```bash
# 导出所有已发布文章
yuque-sync export --all

# 导出指定文章
yuque-sync export --article-id 123

# 导出指定状态的文章
yuque-sync export --status published

# 导出指定分类的文章
yuque-sync export --category "前端"

# 导出时指定格式
yuque-sync export --all --format markdown

# 导出时自动发布
yuque-sync export --all --publish

# 预览导出
yuque-sync export --all --dry-run
```

### 7.4 同步命令

```bash
# 双向同步所有文章
yuque-sync sync --all

# 同步指定文章对
yuque-sync sync --article-id 123 --doc-id 456

# 单向同步（语雀→博客）
yuque-sync sync --all --direction yuque-to-blog

# 单向同步（博客→语雀）
yuque-sync sync --all --direction blog-to-yuque

# 强制覆盖冲突
yuque-sync sync --all --force

# 冲突时交互式询问
yuque-sync sync --all --interactive

# 批量同步
yuque-sync sync --all --batch-size 20
```

### 7.5 状态命令

```bash
# 查看所有同步记录
yuque-sync status

# 查看指定文章的同步状态
yuque-sync status --article-id 123

# 查看指定文档的同步状态
yuque-sync status --doc-id 456

# 查看最近的同步日志
yuque-sync status --recent 10

# 查看失败的同步记录
yuque-sync status --failed

# 统计信息
yuque-sync status --stats
```

## 8. 使用场景示例

### 8.1 场景1: 初始化导入

```bash
# 首次使用，从语雀导入所有已发布文章
yuque-sync import --all --publish

# 查看导入结果
yuque-sync status --stats
```

### 8.2 场景2: 日常写作流程

```bash
# 在语雀写好文章后，导入到博客
yuque-sync import --doc-id 123456 --publish

# 博客文章修改后，同步回语雀
yuque-sync sync --article-id 789 --direction blog-to-yuque
```

### 8.3 场景3: 批量迁移

```bash
# 将语雀某个知识库的所有文章迁移到博客
yuque-sync import --book-id 456789 --category "迁移文章" --publish

# 设置定时任务，每天自动同步
# crontab: 0 2 * * * cd /path/to/tool && yuque-sync sync --all
```

### 8.4 场景4: 双平台发布

```bash
# 在博客写文章，同时发布到语雀
yuque-sync export --article-id 123 --publish

# 语雀文章更新后，同步到博客
yuque-sync sync --doc-id 456 --direction yuque-to-blog
```

## 9. 高级特性

### 9.1 增量同步

通过比较 `updated_at` 时间戳，仅同步变更的内容：

```typescript
async detectChanges(article: BlogArticle, doc: YuqueDocDetail) {
  const articleTime = new Date(article.updated_at).getTime();
  const docTime = new Date(doc.updated_at).getTime();

  if (articleTime > docTime) {
    return 'blog_newer';
  } else if (docTime > articleTime) {
    return 'yuque_newer';
  } else {
    return 'equal';
  }
}
```

### 9.2 冲突处理策略

```typescript
enum ConflictStrategy {
  SKIP = 'skip',              // 跳过冲突
  OVERWRITE = 'overwrite',    // 覆盖目标
  MERGE = 'merge',           // 智能合并
  ASK = 'ask',               // 交互式询问
  YUQUE_WINS = 'yuque_wins', // 语雀优先
  BLOG_WINS = 'blog_wins'    // 博客优先
}

async resolveConflict(conflict: Conflict, strategy: ConflictStrategy) {
  switch (strategy) {
    case ConflictStrategy.SKIP:
      // 跳过，记录日志
      break;
    case ConflictStrategy.OVERWRITE:
      // 使用源数据覆盖目标
      break;
    case ConflictStrategy.MERGE:
      // 智能合并内容
      break;
    case ConflictStrategy.ASK:
      // 交互式询问用户
      break;
  }
}
```

### 9.3 图片处理

```typescript
enum ImageStrategy {
  KEEP_ORIGINAL = 'keep_original',      // 保持原始URL
  DOWNLOAD_LOCAL = 'download_local',    // 下载到本地
  UPLOAD_CDN = 'upload_cdn',           // 上传到CDN
  COPY_TO_YUQUE = 'copy_to_yuque'      // 复制到语雀
}

async processImages(content: string, strategy: ImageStrategy): Promise<string> {
  switch (strategy) {
    case ImageStrategy.DOWNLOAD_LOCAL:
      // 下载图片到本地，替换URL
      break;
    case ImageStrategy.UPLOAD_CDN:
      // 上传到CDN，替换URL
      break;
    case ImageStrategy.COPY_TO_YUQUE:
      // 上传到语雀，使用语雀图片URL
      break;
  }
}
```

### 9.4 批量操作与限流

```typescript
class BatchProcessor {
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options: BatchOptions
  ): Promise<R[]> {
    const results: R[] = [];
    const batchSize = options.batchSize || 10;
    const delay = options.delay || 1000;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);

      // 延迟，避免API限流
      if (i + batchSize < items.length) {
        await this.delay(delay);
      }
    }

    return results;
  }
}
```

## 10. 错误处理

### 10.1 错误类型

```typescript
enum ErrorCode {
  // 配置错误
  INVALID_CONFIG = 'INVALID_CONFIG',
  MISSING_TOKEN = 'MISSING_TOKEN',

  // API错误
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',

  // 数据库错误
  DB_ERROR = 'DB_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // 同步错误
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  TRANSFORM_ERROR = 'TRANSFORM_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

class YuqueSyncError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'YuqueSyncError';
  }
}
```

### 10.2 重试机制

```typescript
async retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = 2 } = options;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const waitTime = delay * Math.pow(backoff, i);
      logger.warn(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms`);
      await this.delay(waitTime);
    }
  }

  throw new Error('Max retries exceeded');
}
```

## 11. 测试策略

### 11.1 单元测试

- 字段映射测试
- 内容转换测试
- 数据验证测试

### 11.2 集成测试

- API调用测试
- 数据库操作测试
- 端到端同步测试

### 11.3 Mock测试

```typescript
// Mock Yuque API
const mockYuqueClient = {
  getDocs: jest.fn().mockResolvedValue(mockDocs),
  getDoc: jest.fn().mockResolvedValue(mockDocDetail),
  createDoc: jest.fn().mockResolvedValue(mockCreatedDoc)
};

// Mock Database
const mockBlogClient = {
  getArticleById: jest.fn().mockResolvedValue(mockArticle),
  createArticle: jest.fn().mockResolvedValue(createdArticle)
};
```

## 12. 部署方案

### 12.1 Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "dist/index.js"]
```

### 12.2 定时任务

```bash
# crontab
# 每天凌晨2点自动同步
0 2 * * * cd /path/to/yuque-sync && npm run sync >> /var/log/yuque-sync.log 2>&1
```

### 12.3 CI/CD集成

```yaml
# .github/workflows/sync.yml
name: Yuque Sync

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run sync
        run: npm run sync
        env:
          YUQUE_TOKEN: ${{ secrets.YUQUE_TOKEN }}
```

## 13. 性能优化

### 13.1 并发控制

```typescript
import pLimit from 'p-limit';

const limit = pLimit(5); // 最多5个并发请求

async function processDocs(docs: YuqueDoc[]) {
  return Promise.all(
    docs.map(doc => limit(() => processDoc(doc)))
  );
}
```

### 13.2 缓存策略

```typescript
class CacheManager {
  private cache = new Map();

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expire) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: any, ttl: number) {
    this.cache.set(key, {
      value,
      expire: Date.now() + ttl
    });
  }
}
```

### 13.3 数据库优化

- 使用批量插入
- 创建适当的索引
- 使用事务确保数据一致性

## 14. 监控与日志

### 14.1 日志级别

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

logger.debug('详细调试信息');
logger.info('常规操作信息');
logger.warn('警告信息');
logger.error('错误信息', { error, stack });
```

### 14.2 性能监控

```typescript
class PerformanceMonitor {
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - start;
      logger.info(`${name} completed in ${duration}ms`);
    }
  }
}
```

## 15. 开发计划

### Phase 1: 基础功能 (Week 1-2)
- [x] 项目初始化
- [ ] YuqueClient 实现
- [ ] BlogClient 实现
- [ ] 基础字段映射
- [ ] 简单的导入/导出功能

### Phase 2: 核心功能 (Week 3-4)
- [ ] ContentTransformer 实现
- [ ] 完整的字段映射
- [ ] 分类和标签处理
- [ ] 图片处理
- [ ] CLI命令实现

### Phase 3: 高级功能 (Week 5-6)
- [ ] 双向同步
- [ ] 冲突检测和解决
- [ ] 增量同步
- [ ] 批量操作优化

### Phase 4: 完善与优化 (Week 7-8)
- [ ] 错误处理和重试
- [ ] 性能优化
- [ ] 单元测试
- [ ] 文档完善
- [ ] 部署方案

## 16. 参考资料

- [语雀OpenAPI文档](https://www.yuque.com/yuque/developer/api)
- [博客数据库Schema](../../blog-service/src/main/resources/schema.sql)
- [Prisma文档](https://www.prisma.io/docs)
- [Commander.js文档](https://github.com/tj/commander.js)
