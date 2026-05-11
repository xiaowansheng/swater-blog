# 语雀同步工具 - 设计文档 V2.0

## 1. 项目概述

### 1.1 功能目标

创建一个独立的语雀同步工具，具有以下特点：

1. **独立数据库** - 使用独立的SQLite数据库存储映射关系和日志
2. **Web可视化界面** - 提供友好的Web界面进行操作
3. **核心同步功能** - 支持导入、导出、双向同步
4. **灵活配置** - 支持字段映射和同步策略配置

### 1.2 技术栈

#### 后端
- **运行时**: Node.js 18+
- **框架**: Express.js
- **ORM**: Prisma
- **数据库**: SQLite (独立文件)
- **任务队列**: Bull (基于Redis)
- **WebSocket**: Socket.io
- **日志**: Winston
- **认证**: JWT

#### 前端
- **框架**: React 18
- **UI库**: Ant Design 5
- **状态管理**: Zustand / Jotai
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **实时通信**: Socket.io-client
- **构建工具**: Vite

#### 开发工具
- **TypeScript**
- **ESLint + Prettier**
- **Vitest (测试)**
- **Docker (部署)**

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Web Browser                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Config    │  │   Dashboard  │  │   Sync Logs   │  │
│  │   Page      │  │   Page       │  │   Page        │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                  │           │
│         └─────────────────┴──────────────────┘           │
│                           │                               │
│                    ┌──────▼──────┐                       │
│                    │   React     │                       │
│                    │   App       │                       │
│                    └──────┬──────┘                       │
└───────────────────────────┼───────────────────────────────┘
                            │ HTTP + WebSocket
                            │
┌───────────────────────────▼───────────────────────────────┐
│                    Backend Server                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │              REST API (Express)                     │  │
│  │  - /api/config       - /api/sync                   │  │
│  │  - /api/import       - /api/export                 │  │
│  │  - /api/mapping      - /api/logs                   │  │
│  └───────────────┬────────────────────────────────────┘  │
│                  │                                         │
│  ┌───────────────▼────────────────────────────────────┐  │
│  │         WebSocket Server (Socket.io)                │  │
│  │         - Real-time sync progress                  │  │
│  │         - Live log streaming                       │  │
│  └───────────────┬────────────────────────────────────┘  │
│                  │                                         │
│  ┌───────────────▼────────────────────────────────────┐  │
│  │           Service Layer                             │  │
│  │  - YuqueService   - BlogService                     │  │
│  │  - SyncService    - MappingService                  │  │
│  └───────────────┬────────────────────────────────────┘  │
│                  │                                         │
│  ┌───────────────▼────────────────────────────────────┐  │
│  │              Job Queue (Bull)                       │  │
│  │         - Async sync tasks                          │  │
│  │         - Progress tracking                         │  │
│  └───────────────┬────────────────────────────────────┘  │
└──────────────────┼─────────────────────────────────────────┘
                   │
     ┌─────────────┼─────────────┬─────────────┐
     │             │             │             │
┌────▼───┐   ┌────▼───┐   ┌────▼────┐   ┌────▼────┐
│  Yuque │   │  Blog  │   │ SQLite  │   │  Redis  │
│   API  │   │  DB    │   │ (Local) │   │(Queue)  │
└────────┘   └────────┘   └─────────┘   └─────────┘
```

### 2.2 项目结构

```
yuque-sync/
├── backend/                       # 后端代码
│   ├── src/
│   │   ├── api/                   # API路由
│   │   │   ├── config.ts          # 配置管理API
│   │   │   ├── sync.ts            # 同步操作API
│   │   │   ├── import.ts          # 导入API
│   │   │   ├── export.ts          # 导出API
│   │   │   ├── mapping.ts         # 映射管理API
│   │   │   └── logs.ts            # 日志查询API
│   │   ├── services/              # 业务服务层
│   │   │   ├── YuqueService.ts    # 语雀服务
│   │   │   ├── BlogService.ts     # 博客服务
│   │   │   ├── SyncService.ts     # 同步服务
│   │   │   ├── MappingService.ts  # 映射服务
│   │   │   └── QueueService.ts    # 队列服务
│   │   ├── models/                # 数据模型
│   │   │   ├── YuqueDoc.ts
│   │   │   ├── BlogArticle.ts
│   │   │   └── SyncJob.ts
│   │   ├── core/                  # 核心模块
│   │   │   ├── YuqueClient.ts     # 语雀API客户端
│   │   │   ├── BlogClient.ts      # 博客DB客户端
│   │   │   ├── FieldMapper.ts     # 字段映射器
│   │   │   ├── ContentTransformer.ts  # 内容转换器
│   │   │   └── ConflictResolver.ts    # 冲突解决器
│   │   ├── middleware/            # 中间件
│   │   │   ├── auth.ts            # 认证中间件
│   │   │   ├── error.ts           # 错误处理
│   │   │   └── validation.ts      # 数据验证
│   │   ├── websocket/             # WebSocket
│   │   │   ├── syncHandler.ts     # 同步进度推送
│   │   │   └── logHandler.ts      # 日志流式推送
│   │   ├── utils/                 # 工具函数
│   │   │   ├── logger.ts
│   │   │   ├── validator.ts
│   │   │   └── helpers.ts
│   │   ├── config/                # 配置
│   │   │   ├── index.ts
│   │   │   └── schema.ts          # 配置Schema
│   │   └── index.ts               # 入口文件
│   ├── prisma/                    # Prisma配置
│   │   ├── schema.prisma          # 数据库Schema
│   │   └── migrations/            # 迁移文件
│   ├── queues/                    # 队列处理器
│   │   ├── syncQueue.ts
│   │   └── importQueue.ts
│   ├── tests/                     # 测试
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # 前端代码
│   ├── src/
│   │   ├── pages/                 # 页面组件
│   │   │   ├── Dashboard.tsx      # 仪表盘
│   │   │   ├── Config.tsx         # 配置管理
│   │   │   ├── Import.tsx         # 导入页面
│   │   │   ├── Export.tsx         # 导出页面
│   │   │   ├── Sync.tsx           # 同步页面
│   │   │   ├── Mapping.tsx        # 映射管理
│   │   │   └── Logs.tsx           # 日志查看
│   │   ├── components/            # 通用组件
│   │   │   ├── ConfigForm.tsx     # 配置表单
│   │   │   ├── SyncProgress.tsx   # 同步进度
│   │   │   ├── LogViewer.tsx      # 日志查看器
│   │   │   ├── MappingTable.tsx   # 映射表格
│   │   │   ├── StatCard.tsx       # 统计卡片
│   │   │   └── ConflictDialog.tsx # 冲突处理对话框
│   │   ├── services/              # API服务
│   │   │   ├── api.ts             # API客户端
│   │   │   ├── socket.ts          # WebSocket
│   │   │   └── index.ts
│   │   ├── store/                 # 状态管理
│   │   │   ├── configStore.ts     # 配置状态
│   │   │   ├── syncStore.ts       # 同步状态
│   │   │   └── logStore.ts        # 日志状态
│   │   ├── types/                 # TypeScript类型
│   │   │   ├── config.ts
│   │   │   ├── sync.ts
│   │   │   └── api.ts
│   │   ├── utils/                 # 工具函数
│   │   │   ├── format.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── data/                          # 数据目录
│   ├── yuque-sync.db             # SQLite数据库
│   └── logs/                     # 日志文件
│
├── docker/                        # Docker配置
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── scripts/                       # 脚本
│   ├── setup.sh                  # 初始化脚本
│   └── migrate.sh                # 迁移脚本
│
├── docs/                          # 文档
│   └── DESIGN_V2.md              # 本文档
│
├── package.json                   # Monorepo根
├── README.md
└── LICENSE
```

## 3. 独立数据库设计

### 3.1 数据库Schema (Prisma)

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "sqlite"
  url      = "file:../data/yuque-sync.db"
}

// ==================== 配置相关 ====================

model Config {
  id        BigInt   @id @default(autoincrement())
  key       String   @unique
  value     String
  category  String   // yuque | blog | mapping | sync
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("config")
}

// ==================== 映射关系 ====================

model ArticleMapping {
  id             BigInt   @id @default(autoincrement())
  articleId      BigInt   @default(0)       // 博客文章ID
  articleKey     String?                     // 博客文章唯一标识
  docId          BigInt                      // 语雀文档ID
  docSlug        String?                     // 语雀文档路径
  docTitle       String?                     // 语雀文档标题
  bookId         BigInt?                     // 语雀知识库ID
  lastSyncTime   DateTime?
  syncDirection  String?                     // yuque_to_blog | blog_to_yuque | bidirectional
  syncCount      Int      @default(0)
  lastSyncStatus String?                     // success | failed
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([articleId])
  @@unique([docId])
  @@index([bookId])
  @@index([lastSyncTime])
  @@map("article_mapping")
}

// ==================== 同步任务 ====================

model SyncJob {
  id              BigInt   @id @default(autoincrement())
  jobType         String                     // import | export | sync
  syncDirection   String                     // yuque_to_blog | blog_to_yuque | bidirectional
  status          String   @default("pending") // pending | running | completed | failed | cancelled
  totalItems      Int      @default(0)
  processedItems  Int      @default(0)
  successItems    Int      @default(0)
  failedItems     Int      @default(0)
  skippedItems    Int      @default(0)

  // 任务配置
  config          String                      // JSON配置

  // 结果统计
  startTime       DateTime?
  endTime         DateTime?
  duration        Int?                        // 毫秒

  // 错误信息
  errorMessage    String?

  // 进度信息
  currentItemId   String?
  currentItemName String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
  @@index([jobType])
  @@index([createdAt])
  @@map("sync_job")
}

// ==================== 同步日志 ====================

model SyncLog {
  id            BigInt   @id @default(autoincrement())
  jobId         BigInt?                     // 关联的同步任务ID

  // 关联对象
  articleId     BigInt?
  docId         BigInt?

  // 操作信息
  operation     String                     // import | export | sync | delete
  direction     String                     // yuque_to_blog | blog_to_yuque

  // 状态
  status        String                     // success | failed | warning
  message       String?

  // 详细信息
  errorMessage  String?
  metadata      String?                    // JSON元数据

  // 时间
  createdAt     DateTime @default(now())

  @@index([jobId])
  @@index([articleId])
  @@index([docId])
  @@index([status])
  @@index([createdAt])
  @@map("sync_log")
}

// ==================== 冲突记录 ====================

model SyncConflict {
  id            BigInt   @id @default(autoincrement())

  // 关联对象
  articleId     BigInt
  docId         BigInt
  jobId         BigInt?

  // 冲突信息
  conflictType  String                     // content_updated | deleted | status_mismatch
  articleData   String?                    // 博客文章数据JSON
  docData       String?                    // 语雀文档数据JSON

  // 解决方案
  resolution    String?                    // skip | overwrite_blog | overwrite_yuque | merge
  resolvedAt    DateTime?

  createdAt     DateTime @default(now())

  @@index([articleId])
  @@index([docId])
  @@index([jobId])
  @@map("sync_conflict")
}

// ==================== 统计数据 ====================

model SyncStats {
  id              BigInt   @id @default(autoincrement())
  date            DateTime @default(now()) @db.Date

  // 文章统计
  totalArticles   Int      @default(0)
  totalDocs       Int      @default(0)
  mappedCount     Int      @default(0)

  // 同步统计
  importCount     Int      @default(0)
  exportCount     Int      @default(0)
  syncCount       Int      @default(0)

  // 成功率
  successRate     Float    @default(0)

  // 时间统计
  lastSyncTime    DateTime?

  @@unique([date])
  @@map("sync_stats")
}
```

### 3.2 数据库初始化脚本

```typescript
// backend/src/db/init.ts

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

export async function initDatabase() {
  const dataDir = path.join(process.cwd(), 'data');
  const dbPath = path.join(dataDir, 'yuque-sync.db');

  // 确保数据目录存在
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  });

  // 运行迁移
  await prisma.$connect();

  // 初始化默认配置
  await initDefaultConfig(prisma);

  return prisma;
}

async function initDefaultConfig(prisma: PrismaClient) {
  // 检查是否已初始化
  const existingConfig = await prisma.config.count();
  if (existingConfig > 0) return;

  // 插入默认配置
  await prisma.config.createMany({
    data: [
      // 语雀配置
      {
        key: 'yuque.token',
        value: '',
        category: 'yuque',
      },
      {
        key: 'yuque.baseUrl',
        value: 'https://www.yuque.com/api/v2',
        category: 'yuque',
      },
      {
        key: 'yuque.namespace',
        value: '',
        category: 'yuque',
      },

      // 博客数据库配置
      {
        key: 'blog.type',
        value: 'mysql',
        category: 'blog',
      },
      {
        key: 'blog.host',
        value: 'localhost',
        category: 'blog',
      },
      {
        key: 'blog.port',
        value: '3306',
        category: 'blog',
      },
      {
        key: 'blog.database',
        value: 'blog',
        category: 'blog',
      },
      {
        key: 'blog.username',
        value: 'root',
        category: 'blog',
      },
      {
        key: 'blog.password',
        value: '',
        category: 'blog',
      },

      // 同步配置
      {
        key: 'sync.format',
        value: 'markdown',
        category: 'sync',
      },
      {
        key: 'sync.conflictStrategy',
        value: 'skip',
        category: 'sync',
      },
      {
        key: 'sync.autoPublish',
        value: 'false',
        category: 'sync',
      },
      {
        key: 'sync.batchSize',
        value: '10',
        category: 'sync',
      },
      {
        key: 'sync.delayBetweenRequests',
        value: '1000',
        category: 'sync',
      },
    ],
  });
}
```

## 4. API接口设计

### 4.1 REST API

#### 配置管理 API

```typescript
// 获取所有配置
GET /api/config
Response: {
  yuque: { token, baseUrl, namespace },
  blog: { type, host, port, database, username, password },
  mapping: { ... },
  sync: { ... }
}

// 更新配置
PUT /api/config
Body: {
  yuque?: { token?, baseUrl?, namespace? },
  blog?: { type?, host?, port?, database?, username?, password? },
  sync?: { ... }
}
Response: { success: true }

// 测试连接
POST /api/config/test
Body: { type: 'yuque' | 'blog' }
Response: {
  success: boolean,
  message: string,
  data?: any
}
```

#### 同步操作 API

```typescript
// 创建同步任务
POST /api/sync/job
Body: {
  type: 'import' | 'export' | 'sync',
  direction: 'yuque_to_blog' | 'blog_to_yuque' | 'bidirectional',
  options: {
    bookId?: string,
    docIds?: string[],
    articleIds?: number[],
    category?: string,
    publish?: boolean,
    force?: boolean,
    dryRun?: boolean
  }
}
Response: {
  jobId: string,
  status: 'pending'
}

// 获取任务状态
GET /api/sync/job/:id
Response: {
  id: string,
  type: string,
  status: string,
  progress: {
    total: number,
    processed: number,
    success: number,
    failed: number,
    skipped: number
  },
  currentItem?: {
    id: string,
    name: string
  },
  startTime: string,
  endTime?: string,
  duration?: number
}

// 取消任务
POST /api/sync/job/:id/cancel
Response: { success: true }

// 获取任务列表
GET /api/sync/jobs
Query: {
  page?: number,
  pageSize?: number,
  status?: string,
  type?: string
}
Response: {
  total: number,
  items: SyncJob[]
}
```

#### 导入 API

```typescript
// 获取语雀文档列表
GET /api/import/yuque/docs
Query: {
  bookId: string,
  page?: number,
  pageSize?: number
}
Response: {
  total: number,
  items: YuqueDoc[]
}

// 预览导入结果
POST /api/import/preview
Body: {
  docIds: string[],
  options?: { category?, tags?, publish? }
}
Response: {
  items: Array<{
    yuque: YuqueDoc,
    blog: BlogArticleData,
    warnings?: string[]
  }>
}

// 执行导入
POST /api/import/execute
Body: {
  docIds: string[],
  options: {
    category?: string,
    publish?: boolean,
    createMapping?: boolean
  }
}
Response: {
  jobId: string
}
```

#### 导出 API

```typescript
// 获取博客文章列表
GET /api/export/blog/articles
Query: {
  page?: number,
  pageSize?: number,
  status?: number,
  categoryId?: number
}
Response: {
  total: number,
  items: BlogArticle[]
}

// 预览导出结果
POST /api/export/preview
Body: {
  articleIds: number[],
  options?: { format?, publish? }
}
Response: {
  items: Array<{
    blog: BlogArticle,
    yuque: CreateDocData,
    warnings?: string[]
  }>
}

// 执行导出
POST /api/export/execute
Body: {
  articleIds: number[],
  options: {
    format?: 'markdown' | 'html',
    publish?: boolean,
    createMapping?: boolean
  }
}
Response: {
  jobId: string
}
```

#### 映射管理 API

```typescript
// 获取映射列表
GET /api/mapping
Query: {
  page?: number,
  pageSize?: number,
  articleId?: number,
  docId?: string,
  bookId?: string
}
Response: {
  total: number,
  items: ArticleMapping[]
}

// 创建映射
POST /api/mapping
Body: {
  articleId: number,
  docId: string,
  docSlug?: string,
  bookId?: string
}
Response: { success: true, id: number }

// 删除映射
DELETE /api/mapping/:id
Response: { success: true }

// 批量删除映射
DELETE /api/mapping
Body: { ids: number[] }
Response: { success: true, deleted: number }
```

#### 日志查询 API

```typescript
// 获取日志列表
GET /api/logs
Query: {
  page?: number,
  pageSize?: number,
  jobId?: string,
  articleId?: number,
  docId?: string,
  status?: string,
  startDate?: string,
  endDate?: string
}
Response: {
  total: number,
  items: SyncLog[]
}

// 获取日志详情
GET /api/logs/:id
Response: SyncLog

// 获取统计信息
GET /api/logs/stats
Query: {
  startDate?: string,
  endDate?: string
}
Response: {
  total: number,
  success: number,
  failed: number,
  byDate: Array<{
    date: string,
    success: number,
    failed: number
  }>
}
```

### 4.2 WebSocket 事件

#### 客户端 → 服务器

```typescript
// 订阅任务进度
emit('sync:subscribe', { jobId: string })

// 取消订阅
emit('sync:unsubscribe', { jobId: string })

// 订阅实时日志
emit('logs:subscribe', { options?: {...} })

// 取消日志订阅
emit('logs:unsubscribe')
```

#### 服务器 → 客户端

```typescript
// 任务进度更新
on('sync:progress', (data: {
  jobId: string,
  progress: {
    total: number,
    processed: number,
    success: number,
    failed: number,
    skipped: number,
    percentage: number
  },
  currentItem?: {
    id: string,
    name: string
  }
}) => {})

// 任务完成
on('sync:complete', (data: {
  jobId: string,
  status: 'completed' | 'failed',
  result: {...}
}) => {})

// 实时日志
on('log:new', (data: SyncLog) => {})
```

## 5. Web界面设计

### 5.1 页面结构

```
App
├── Layout (侧边栏 + 主内容区)
│   ├── Sidebar
│   │   ├── Dashboard (仪表盘)
│   │   ├── Import (导入)
│   │   ├── Export (导出)
│   │   ├── Sync (同步)
│   │   ├── Mapping (映射管理)
│   │   ├── Config (配置)
│   │   └── Logs (日志)
│   └── Content
└── Login (可选，如果需要认证)
```

### 5.2 页面详细设计

#### 5.2.1 仪表盘 (Dashboard)

```tsx
// src/pages/Dashboard.tsx

<PageContainer title="仪表盘">
  {/* 统计卡片 */}
  <Row gutter={16}>
    <Col span={6}>
      <StatCard
        title="总文章数"
        value={stats.totalArticles}
        icon={<FileTextOutlined />}
        trend={{ value: '+12', percent: '5%' }}
      />
    </Col>
    <Col span={6}>
      <StatCard
        title="语雀文档数"
        value={stats.totalDocs}
        icon={<BookOutlined />}
      />
    </Col>
    <Col span={6}>
      <StatCard
        title="已映射"
        value={stats.mappedCount}
        icon={<LinkOutlined />}
      />
    </Col>
    <Col span={6}>
      <StatCard
        title="今日同步"
        value={stats.todaySync}
        icon={<SyncOutlined />}
      />
    </Col>
  </Row>

  {/* 图表 */}
  <Row gutter={16} style={{ marginTop: 16 }}>
    <Col span={12}>
      <Card title="同步趋势">
        <SyncTrendChart data={syncTrendData} />
      </Card>
    </Col>
    <Col span={12}>
      <Card title="同步成功率">
        <SuccessRateChart data={successRateData} />
      </Card>
    </Col>
  </Row>

  {/* 最近任务 */}
  <Card title="最近同步任务" style={{ marginTop: 16 }}>
    <RecentJobsTable data={recentJobs} />
  </Card>
</PageContainer>
```

#### 5.2.2 配置管理 (Config)

```tsx
// src/pages/Config.tsx

<PageContainer title="配置管理">
  <Tabs defaultActiveKey="yuque">
    {/* 语雀配置 */}
    <TabPane tab="语雀配置" key="yuque">
      <Card>
        <Form
          layout="vertical"
          onFinish={handleSaveYuqueConfig}
          initialValues={yuqueConfig}
        >
          <Form.Item
            label="API Token"
            name="token"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="请输入语雀API Token" />
          </Form.Item>

          <Form.Item label="Base URL" name="baseUrl">
            <Input placeholder="https://www.yuque.com/api/v2" />
          </Form.Item>

          <Form.Item
            label="知识库路径"
            name="namespace"
            extra="格式：group/repo"
          >
            <Input placeholder="请输入知识库路径" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存配置
              </Button>
              <Button onClick={handleTestYuque}>
                测试连接
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </TabPane>

    {/* 博客数据库配置 */}
    <TabPane tab="博客数据库" key="blog">
      <Card>
        <Form
          layout="vertical"
          onFinish={handleSaveBlogConfig}
          initialValues={blogConfig}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="数据库类型" name="type">
                <Select>
                  <Option value="mysql">MySQL</Option>
                  <Option value="postgresql">PostgreSQL</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="主机" name="host">
                <Input placeholder="localhost" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="端口" name="port">
                <Input type="number" placeholder="3306" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="数据库名" name="database">
                <Input placeholder="blog" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="用户名" name="username">
                <Input placeholder="root" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="密码" name="password">
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存配置
              </Button>
              <Button onClick={handleTestBlog}>
                测试连接
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </TabPane>

    {/* 同步配置 */}
    <TabPane tab="同步配置" key="sync">
      <Card>
        <SyncConfigForm />
      </Card>
    </TabPane>

    {/* 映射配置 */}
    <TabPane tab="映射配置" key="mapping">
      <Card>
        <MappingConfigForm />
      </Card>
    </TabPane>
  </Tabs>
</PageContainer>
```

#### 5.2.3 导入页面 (Import)

```tsx
// src/pages/Import.tsx

<PageContainer title="从语雀导入">
  <Row gutter={16}>
    {/* 左侧：语雀文档列表 */}
    <Col span={14}>
      <Card
        title="语雀文档列表"
        extra={
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="选择知识库"
              onChange={handleSelectBook}
            >
              {books.map(book => (
                <Option key={book.id} value={book.id}>
                  {book.name}
                </Option>
              ))}
            </Select>
            <Button onClick={handleRefresh} icon={<ReloadOutlined />}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          columns={[
            { title: '标题', dataIndex: 'title', ellipsis: true },
            { title: '摘要', dataIndex: 'description', ellipsis: true },
            { title: '状态', dataIndex: 'status', render: renderStatus },
            { title: '更新时间', dataIndex: 'updated_at', render: renderTime },
          ]}
          dataSource={yuqueDocs}
          pagination={{ pageSize: 10 }}
          rowKey="id"
        />
      </Card>
    </Col>

    {/* 右侧：导入选项 */}
    <Col span={10}>
      <Card title="导入选项">
        <Form layout="vertical" onFinish={handleImport}>
          <Alert
            message={`已选择 ${selectedRowKeys.length} 篇文档`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item label="分类">
            <Select
              placeholder="选择分类（可选）"
              allowClear
              onChange={setSelectedCategory}
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="标签">
            <Select
              mode="tags"
              placeholder="输入标签（可选）"
              onChange={setTags}
            />
          </Form.Item>

          <Form.Item name="publish" valuePropName="checked">
            <Checkbox>自动发布</Checkbox>
          </Form.Item>

          <Form.Item name="createMapping" valuePropName="checked" initialValue>
            <Checkbox>创建映射关系</Checkbox>
          </Form.Item>

          <Form.Item name="downloadImages" valuePropName="checked" initialValue>
            <Checkbox>下载图片到本地</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={importing}
                disabled={selectedRowKeys.length === 0}
                block
              >
                开始导入
              </Button>
              <Button
                onClick={handlePreview}
                disabled={selectedRowKeys.length === 0}
                block
              >
                预览导入
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 预览结果 */}
      {previewData && (
        <Card title="预览结果" style={{ marginTop: 16 }}>
          <PreviewList data={previewData} />
        </Card>
      )}
    </Col>
  </Row>

  {/* 导入进度弹窗 */}
  <Modal
    title="导入中"
    visible={showProgress}
    footer={null}
    closable={false}
  >
    <SyncProgress jobId={currentJobId} onComplete={handleComplete} />
  </Modal>
</PageContainer>
```

#### 5.2.4 同步页面 (Sync)

```tsx
// src/pages/Sync.tsx

<PageContainer title="双向同步">
  <Row gutter={16}>
    {/* 同步选项 */}
    <Col span={24}>
      <Card title="同步配置">
        <Form layout="inline" onFinish={handleSync}>
          <Form.Item label="同步方向">
            <Select
              style={{ width: 200 }}
              defaultValue="bidirectional"
              onChange={setDirection}
            >
              <Option value="yuque_to_blog">语雀 → 博客</Option>
              <Option value="blog_to_yuque">博客 → 语雀</Option>
              <Option value="bidirectional">双向同步</Option>
            </Select>
          </Form.Item>

          <Form.Item label="同步范围">
            <Select
              style={{ width: 200 }}
              defaultValue="all"
              onChange={setScope}
            >
              <Option value="all">全部已映射</Option>
              <Option value="recent">最近更新的</Option>
              <Option value="failed">上次失败的</Option>
            </Select>
          </Form.Item>

          <Form.Item label="冲突处理">
            <Select
              style={{ width: 200 }}
              defaultValue="skip"
              onChange={setConflictStrategy}
            >
              <Option value="skip">跳过</Option>
              <Option value="yuque_wins">语雀优先</Option>
              <Option value="blog_wins">博客优先</Option>
              <Option value="ask">交互式处理</Option>
            </Select>
          </Form.Item>

          <Form.Item name="force" valuePropName="checked">
            <Checkbox>强制覆盖</Checkbox>
          </Form.Item>

          <Form.Item name="dryRun" valuePropName="checked">
            <Checkbox>预演模式（不实际执行）</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={syncing}
              icon={<SyncOutlined />}
            >
              开始同步
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Col>

    {/* 冲突列表（如果有） */}
    {conflicts.length > 0 && (
      <Col span={24} style={{ marginTop: 16 }}>
        <Card title={`发现 ${conflicts.length} 个冲突`}>
          <ConflictList
            data={conflicts}
            onResolve={handleResolveConflict}
          />
        </Card>
      </Col>
    )}

    {/* 同步进度 */}
    {syncing && (
      <Col span={24} style={{ marginTop: 16 }}>
        <Card title="同步进度">
          <SyncProgress jobId={currentJobId} />
        </Card>
      </Col>
    )}

    {/* 同步结果 */}
    {syncResult && (
      <Col span={24} style={{ marginTop: 16 }}>
        <Card title="同步结果">
          <Result
            status={syncResult.failedItems > 0 ? 'warning' : 'success'}
            title={
              syncResult.failedItems > 0
                ? '同步完成，部分失败'
                : '同步成功'
            }
            subTitle={
              <>
                <p>总计: {syncResult.totalItems}</p>
                <p>成功: {syncResult.successItems}</p>
                <p>失败: {syncResult.failedItems}</p>
                <p>跳过: {syncResult.skippedItems}</p>
              </>
            }
            extra={[
              <Button key="view" onClick={handleViewLogs}>
                查看详细日志
              </Button>,
              <Button key="close" type="primary" onClick={handleClose}>
                关闭
              </Button>,
            ]}
          />
        </Card>
      </Col>
    )}
  </Row>
</PageContainer>
```

#### 5.2.5 映射管理 (Mapping)

```tsx
// src/pages/Mapping.tsx

<PageContainer
  title="映射管理"
  extra={[
    <Button key="refresh" onClick={handleRefresh}>
      刷新
    </Button>,
    <Button key="create" type="primary" onClick={handleShowCreateModal}>
      新建映射
    </Button>,
  ]}
>
  <Card>
    <Table
      columns={[
        {
          title: '博客文章',
          dataIndex: 'articleKey',
          render: (text, record) => (
            <a href="#" onClick={() => handleViewArticle(record.articleId)}>
              {text || `#${record.articleId}`}
            </a>
          ),
        },
        {
          title: '语雀文档',
          dataIndex: 'docTitle',
          render: (text, record) => (
            <a
              href="#" onClick={() => handleViewDoc(record.docId)}
              target="_blank"
            >
              {text || `#${record.docId}`}
            </a>
          ),
        },
        {
          title: '最后同步',
          dataIndex: 'lastSyncTime',
          render: renderTime,
        },
        {
          title: '同步方向',
          dataIndex: 'syncDirection',
          render: renderDirection,
        },
        {
          title: '同步次数',
          dataIndex: 'syncCount',
        },
        {
          title: '状态',
          dataIndex: 'lastSyncStatus',
          render: renderStatus,
        },
        {
          title: '操作',
          render: (text, record) => (
            <Space>
              <Button
                size="small"
                onClick={() => handleSync(record)}
              >
                同步
              </Button>
              <Button
                size="small"
                danger
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            </Space>
          ),
        },
      ]}
      dataSource={mappings}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
      rowKey="id"
      loading={loading}
    />
  </Card>

  {/* 创建映射弹窗 */}
  <Modal
    title="新建映射"
    visible={showCreateModal}
    onCancel={handleHideCreateModal}
    onOk={handleCreateMapping}
  >
    <Form layout="vertical">
      <Form.Item label="博客文章ID" required>
        <InputNumber
          style={{ width: '100%' }}
          placeholder="请输入博客文章ID"
          onChange={setArticleId}
        />
      </Form.Item>
      <Form.Item label="语雀文档ID" required>
        <Input
          placeholder="请输入语雀文档ID"
          onChange={(e) => setDocId(e.target.value)}
        />
      </Form.Item>
    </Form>
  </Modal>
</PageContainer>
```

#### 5.2.6 日志查看 (Logs)

```tsx
// src/pages/Logs.tsx

<PageContainer title="同步日志">
  <Card>
    {/* 筛选条件 */}
    <Form layout="inline" style={{ marginBottom: 16 }}>
      <Form.Item label="操作类型">
        <Select
          style={{ width: 150 }}
          placeholder="全部"
          allowClear
          onChange={setOperation}
        >
          <Option value="import">导入</Option>
          <Option value="export">导出</Option>
          <Option value="sync">同步</Option>
        </Select>
      </Form.Item>

      <Form.Item label="状态">
        <Select
          style={{ width: 150 }}
          placeholder="全部"
          allowClear
          onChange={setStatus}
        >
          <Option value="success">成功</Option>
          <Option value="failed">失败</Option>
          <Option value="warning">警告</Option>
        </Select>
      </Form.Item>

      <Form.Item label="日期范围">
        <DatePicker.RangePicker onChange={setDateRange} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={handleSearch}>
          查询
        </Button>
      </Form.Item>

      <Form.Item>
        <Button onClick={handleExport}>导出</Button>
      </Form.Item>
    </Form>

    {/* 日志列表 */}
    <Table
      columns={[
        {
          title: '时间',
          dataIndex: 'createdAt',
          width: 180,
          render: renderTime,
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 100,
          render: renderOperation,
        },
        {
          title: '方向',
          dataIndex: 'direction',
          width: 150,
          render: renderDirection,
        },
        {
          title: '文章',
          dataIndex: 'articleId',
          width: 100,
          render: (text) => text || '-',
        },
        {
          title: '文档',
          dataIndex: 'docId',
          width: 100,
          render: (text) => text || '-',
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: 100,
          render: renderStatus,
        },
        {
          title: '消息',
          dataIndex: 'message',
          ellipsis: true,
        },
        {
          title: '详情',
          width: 100,
          render: (text, record) => (
            <Button
              size="small"
              onClick={() => handleViewDetail(record)}
            >
              查看
            </Button>
          ),
        },
      ]}
      dataSource={logs}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
      rowKey="id"
      loading={loading}
      expandable={{
        expandedRowRender: (record) => (
          <LogDetail log={record} />
        ),
      }}
    />
  </Card>
</PageContainer>
```

### 5.3 通用组件

#### 5.3.1 同步进度组件

```tsx
// src/components/SyncProgress.tsx

interface SyncProgressProps {
  jobId: string;
  onComplete?: (result: SyncResult) => void;
  onError?: (error: Error) => void;
}

export const SyncProgress: React.FC<SyncProgressProps> = ({
  jobId,
  onComplete,
  onError,
}) => {
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 订阅任务进度
    const newSocket = io('/sync');
    newSocket.emit('sync:subscribe', { jobId });

    newSocket.on('sync:progress', (data) => {
      setProgress(data);
    });

    newSocket.on('sync:complete', (data) => {
      onComplete?.(data);
      newSocket.emit('sync:unsubscribe', { jobId });
    });

    newSocket.on('sync:error', (error) => {
      onError?.(error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('sync:unsubscribe', { jobId });
      newSocket.close();
    };
  }, [jobId]);

  if (!progress) return <Spin />;

  const percentage = Math.round(
    (progress.processed / progress.total) * 100
  );

  return (
    <div>
      <Progress
        percent={percentage}
        status={progress.failed > 0 ? 'exception' : 'active'}
      />

      <Statistic.Group style={{ marginTop: 16 }}>
        <Statistic title="总计" value={progress.total} />
        <Statistic title="已处理" value={progress.processed} />
        <Statistic
          title="成功"
          value={progress.success}
          valueStyle={{ color: '#52c41a' }}
        />
        <Statistic
          title="失败"
          value={progress.failed}
          valueStyle={{ color: '#ff4d4f' }}
        />
      </Statistic.Group>

      {progress.currentItem && (
        <Alert
          style={{ marginTop: 16 }}
          message={`正在处理: ${progress.currentItem.name}`}
          type="info"
        />
      )}
    </div>
  );
};
```

#### 5.3.2 日志查看器组件

```tsx
// src/components/LogViewer.tsx

interface LogViewerProps {
  log: SyncLog;
}

export const LogViewer: React.FC<LogViewerProps> = ({ log }) => {
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (log.metadata) {
      try {
        setMetadata(JSON.parse(log.metadata));
      } catch (e) {
        console.error('Failed to parse metadata:', e);
      }
    }
  }, [log]);

  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="时间">
        {dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}
      </Descriptions.Item>
      <Descriptions.Item label="操作">
        {renderOperation(log.operation)}
      </Descriptions.Item>
      <Descriptions.Item label="方向">
        {renderDirection(log.direction)}
      </Descriptions.Item>
      <Descriptions.Item label="状态">
        {renderStatus(log.status)}
      </Descriptions.Item>
      <Descriptions.Item label="消息">
        {log.message}
      </Descriptions.Item>
      {log.errorMessage && (
        <Descriptions.Item label="错误信息">
          <Text type="danger">{log.errorMessage}</Text>
        </Descriptions.Item>
      )}
      {metadata && (
        <Descriptions.Item label="元数据">
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </Descriptions.Item>
      )}
    </Descriptions>
  );
};
```

## 6. 实施计划

### Phase 1: 后端基础 (Week 1-2)
- [x] 设计数据库Schema
- [ ] 初始化项目
- [ ] 实现Prisma配置和迁移
- [ ] 实现核心Service层
- [ ] 实现REST API基础框架
- [ ] 实现配置管理API

### Phase 2: 前端基础 (Week 2-3)
- [ ] 初始化React项目
- [ ] 实现基础布局和路由
- [ ] 实现配置管理页面
- [ ] 实现仪表盘页面
- [ ] 集成API客户端

### Phase 3: 核心功能 (Week 3-4)
- [ ] 实现导入功能和页面
- [ ] 实现导出功能和页面
- [ ] 实现映射管理功能
- [ ] 实现日志查看功能

### Phase 4: 高级功能 (Week 4-5)
- [ ] 实现双向同步功能
- [ ] 实现WebSocket实时通信
- [ ] 实现任务队列
- [ ] 实现进度监控

### Phase 5: 优化与部署 (Week 5-6)
- [ ] 错误处理和重试机制
- [ ] 性能优化
- [ ] Docker部署配置
- [ ] 文档完善

## 7. 部署方案

### 7.1 Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "${BACKEND_PUBLISHED_PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./data/yuque-sync.db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    depends_on:
      - redis
    restart: unless-stopped

  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "${FRONTEND_PUBLISHED_PORT:-8080}:80"
    depends_on:
      - backend
    restart: unless-stopped

  # Redis（任务队列）
  redis:
    image: redis:7-alpine
    ports:
      - "${REDIS_PUBLISHED_PORT:-6379}:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  # Nginx（反向代理）
  nginx:
    image: nginx:alpine
    ports:
      - "${NGINX_HTTP_PUBLISHED_PORT:-80}:80"
      - "${NGINX_HTTPS_PUBLISHED_PORT:-443}:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  redis-data:
```

### 7.2 启动脚本

```bash
#!/bin/bash
# scripts/start.sh

echo "🚀 Starting Yuque Sync Tool..."

# 检查环境
if [ ! -f .env ]; then
  echo "⚠️  .env file not found, copying from .env.example..."
  cp .env.example .env
fi

# 创建数据目录
mkdir -p data logs

# 启动服务
docker compose up -d

echo "✅ Services started!"
echo "📝 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3000"
echo "📊 Check logs: docker compose logs -f"
```

## 8. 安全考虑

### 8.1 认证与授权

```typescript
// 使用JWT进行简单认证
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

### 8.2 数据加密

- 数据库密码使用加密存储
- API Token使用加密存储
- WebSocket使用WSS (WebSocket Secure)

### 8.3 访问控制

- 配置文件读写权限控制
- API调用频率限制
- CORS配置

## 9. 监控与日志

### 9.1 日志配置

```typescript
// backend/src/utils/logger.ts

import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### 9.2 性能监控

- API响应时间监控
- 任务执行时间统计
- 数据库查询性能
- 错误率统计

## 10. 参考资料

- [Prisma SQLite](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [Express.js](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Bull](https://docs.bullmq.io/)
