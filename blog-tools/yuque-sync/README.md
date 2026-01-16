# 语雀博客同步工具

一个全功能的语雀知识库与博客数据库之间的双向同步工具，支持导入、导出和智能同步功能。

## 功能特性

### 核心功能
- **导入**: 从语雀知识库批量导入文档到博客数据库
- **导出**: 将博客文章批量导出到语雀知识库
- **双向同步**: 智能双向同步，自动检测并处理冲突
- **字段映射**: 灵活配置数据库表和字段映射关系
- **增量同步**: 支持按最新更新时间增量同步
- **异步任务**: 后台异步执行同步任务，实时查看进度

### 管理功能
- **映射管理**: 查看和管理文章与文档的映射关系
- **日志查看**: 详细的同步操作日志记录
- **任务跟踪**: 实时查看同步任务执行进度
- **配置管理**: 可视化配置语雀和博客数据库连接
- **统计仪表盘**: 查看同步统计信息和最近任务

## 技术栈

### 前端
- **Next.js 14**: App Router, Server Components, Server Actions
- **React 18**: 客户端交互组件
- **TypeScript**: 全栈类型安全
- **Tailwind CSS**: 实用优先的样式框架

### 后端
- **Next.js Server Actions**: 服务端数据处理
- **Prisma ORM**: SQLite数据库访问
- **MySQL2**: 博客数据库连接池

### 数据库
- **SQLite**: 同步元数据存储
- **MySQL**: 博客主数据库

### 依赖库
- **axios**: HTTP客户端
- **marked**: Markdown转HTML
- **turndown**: HTML转Markdown
- **slugify**: URL友好的标识符生成
- **sonner**: Toast通知
- **prisma**: 数据库ORM

## 项目结构

```
yuque-sync/
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── app/
│   ├── dashboard/             # 仪表盘页面
│   ├── config/                # 配置管理页面
│   ├── import/                # 导入页面
│   ├── export/                # 导出页面
│   ├── sync/                  # 同步页面
│   │   └── job/[jobId]/       # 任务进度页面
│   ├── mapping/               # 映射管理页面
│   ├── logs/                  # 日志查看页面
│   └── actions/               # Server Actions
│       ├── config.ts
│       ├── import.ts
│       ├── export.ts
│       ├── sync.ts
│       ├── mapping.ts
│       ├── logs.ts
│       └── job.ts
├── components/
│   ├── ui/                    # 基础UI组件
│   ├── config/                # 配置相关组件
│   ├── import/                # 导入相关组件
│   ├── export/                # 导出相关组件
│   ├── sync/                  # 同步相关组件
│   ├── mapping/               # 映射管理组件
│   ├── logs/                  # 日志查看组件
│   └── job/                   # 任务进度组件
├── lib/
│   ├── db/
│   │   ├── prisma.ts          # Prisma客户端
│   │   └── seed.ts            # 初始数据
│   ├── yuque/
│   │   └── client.ts          # 语雀API客户端
│   ├── blog/
│   │   └── client.ts          # 博客数据库客户端
│   └── sync/
│       ├── engine.ts          # 同步引擎
│       ├── mapper.ts          # 字段映射器
│       └── transformer.ts     # 内容转换器
└── types/
    ├── yuque.ts               # 语雀类型定义
    └── blog.ts                # 博客类型定义
```

## 快速开始

### 环境要求
- Node.js 18+
- MySQL 5.7+

### 安装步骤

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：
```env
# 语雀配置
YUQUE_TOKEN=your_yuque_token
YUQUE_NAMESPACE=your_yuque_namespace

# 博客数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_blog_database
```

3. **初始化数据库**
```bash
npm run db:migrate
npm run db:seed
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问 http://localhost:3002

### 生产部署

1. **构建应用**
```bash
npm run build
```

2. **启动生产服务器**
```bash
npm start
```

## 使用指南

### 1. 配置管理

访问 http://localhost:3002/config 进行配置：

**语雀配置**
- 语雀Token: 在语雀个人设置中生成
- 命名空间: 知识库的唯一标识
- 知识库ID: 要同步的语雀知识库

**博客数据库配置**
- 数据库地址: MySQL服务器地址
- 端口: 默认3306
- 数据库名: 博客数据库名称
- 用户名和密码: 数据库访问凭证

**同步配置**
- 自动发布: 导入时是否自动发布文章
- 保留原文: 是否保留语雀原文
- 增量同步: 是否只同步更新的内容
- 发布状态: 导入文章的默认状态

点击"测试连接"验证配置是否正确。

### 2. 导入文章

访问 http://localhost:3002/import

1. 从语雀加载文档列表
2. 选择要导入的文档
3. 点击"开始导入"
4. 系统会创建导入任务并跳转到进度页面

### 3. 导出文章

访问 http://localhost:3002/export

1. 从博客加载文章列表
2. 选择要导出的文章
3. 点击"开始导出"
4. 系统会创建导出任务并跳转到进度页面

### 4. 双向同步

访问 http://localhost:3002/sync

1. 选择同步方向：
   - **语雀→博客**: 从语雀导入所有未映射的文档
   - **博客→语雀**: 将所有未导出的文章推送到语雀
   - **双向同步**: 智能双向同步

2. 可选勾选"强制覆盖"，强制覆盖冲突内容

3. 点击"开始同步"

### 5. 映射管理

访问 http://localhost:3002/mapping

查看所有文章-文档映射关系：
- 查看映射详情（文章ID、文档ID、同步时间等）
- 单个同步：更新特定映射的内容
- 删除映射：解除文章与文档的关联

### 6. 查看日志

访问 http://localhost:3002/logs

查看所有同步操作的详细日志：
- 按状态筛选（成功/失败/警告）
- 查看错误信息
- 时间线视图
- 分页浏览

### 7. 任务进度

任务执行时会自动跳转到进度页面：
- 实时进度条
- 统计信息（总数、成功、失败、跳过）
- 当前处理项
- 预计剩余时间
- 取消任务按钮

## 数据库模型

### ArticleMapping（文章映射）
```prisma
model ArticleMapping {
  id             String   @id @default(cuid())
  articleId      BigInt   @default(0)
  docId          BigInt
  lastSyncTime   DateTime?
  syncDirection  String?
  syncCount      Int      @default(0)
  lastSyncStatus String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([articleId])
  @@unique([docId])
}
```

### SyncJob（同步任务）
```prisma
model SyncJob {
  id              String   @id @default(cuid())
  jobType         String
  direction       String
  status          String   @default("pending")
  totalItems      Int      @default(0)
  processedItems  Int      @default(0)
  successItems    Int      @default(0)
  failedItems     Int      @default(0)
  skippedItems    Int      @default(0)
  config          String
  startTime       DateTime?
  endTime         DateTime?
  duration        Int?
  errorMessage    String?
  currentItemName String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### SyncLog（同步日志）
```prisma
model SyncLog {
  id           String   @id @default(cuid())
  jobId        String?
  articleId    BigInt?
  docId        BigInt?
  operation    String
  direction    String
  status       String
  message      String
  errorMessage String?
  createdAt    DateTime @default(now())
}
```

## API参考

### Server Actions

#### 配置管理
```typescript
// 获取配置
async function getConfig()

// 更新配置
async function updateConfig(config: ConfigData)

// 测试连接
async function testConnection(type: 'yuque' | 'blog')
```

#### 导入导出
```typescript
// 从语雀导入
async function importFromYuque(options: ImportOptions)

// 导出到语雀
async function exportToYuque(options: ExportOptions)

// 双向同步
async function bidirectionalSync(options: SyncOptions)
```

#### 映射管理
```typescript
// 获取映射列表
async function getMappings(params?: GetMappingsParams)

// 删除映射
async function deleteMapping(id: string)

// 同步单个映射
async function syncSingleMapping(id: string)
```

#### 日志查询
```typescript
// 获取日志列表
async function getLogs(params?: GetLogsParams)

// 获取日志统计
async function getLogStats()
```

#### 任务管理
```typescript
// 获取任务状态
async function getJobStatus(jobId: string)

// 取消任务
async function cancelJob(jobId: string)
```

## 常见问题

### Q: 如何获取语雀Token？
A: 登录语雀 → 个人设置 → 个人访问令牌 → 生成新令牌

### Q: 同步失败怎么办？
A:
1. 检查配置页面的连接状态
2. 查看日志页面的错误信息
3. 确认语雀知识库ID和博客数据库配置正确

### Q: 如何处理同步冲突？
A: 在同步页面勾选"强制覆盖"选项，可以选择以语雀或博客的内容为准

### Q: 能否定时自动同步？
A: 当前版本需要手动触发，可以使用系统cron工具调用API实现定时同步

### Q: 支持图片同步吗？
A: 当前版本支持文本内容同步，图片建议使用图床外链

## 开发指南

### 添加新的同步字段

1. 编辑 `lib/sync/mapper.ts`，修改映射逻辑
2. 更新 `types/blog.ts` 和 `types/yuque.ts` 类型定义
3. 在 `app/config/page.tsx` 添加字段配置UI

### 扩展同步规则

1. 编辑 `lib/sync/engine.ts` 中的执行逻辑
2. 在 `prisma/schema.prisma` 添加配置字段
3. 在配置页面添加规则设置

### 自定义内容转换

1. 编辑 `lib/sync/transformer.ts`
2. 实现自定义的转换函数
3. 在mapper中调用新的转换逻辑

## 许可证

MIT

## 技术支持

如有问题，请查看日志或提交Issue。
