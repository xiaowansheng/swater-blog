# 语雀博客同步工具

当前实现是一个基于 Next.js 14 的独立工具，用于在语雀知识库和博客数据库之间执行导入、导出和双向同步。

## 1. 当前状态

已落地页面：

- `/dashboard`
- `/config`
- `/import`
- `/export`
- `/sync`
- `/mapping`
- `/logs`

开发端口：`3002`

## 2. 技术栈

- Next.js 14
- React 18
- Prisma + SQLite
- MySQL2
- Tailwind CSS

## 3. 快速开始

### 3.1 安装依赖

```bash
cd blog-tools/yuque-sync
npm install
```

### 3.2 配置环境变量

```bash
cp .env.example .env
```

关键变量：

```env
DATABASE_URL="file:./data/yuque-sync.db"
YUQUE_TOKEN=""
YUQUE_BASE_URL="https://www.yuque.com/api/v2"
YUQUE_NAMESPACE=""
BLOG_TYPE="mysql"
BLOG_HOST="localhost"
BLOG_PORT=3306
BLOG_DATABASE="blog"
BLOG_USERNAME="root"
BLOG_PASSWORD=""
```

### 3.3 初始化数据库

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 3.4 启动

```bash
npm run dev
```

访问：`http://localhost:3002`

## 4. 使用顺序

1. 在 `/config` 完成语雀和博客数据库连接配置
2. 在 `/import` 或 `/export` 执行单向同步
3. 在 `/sync` 执行双向同步
4. 在 `/mapping` 查看映射关系
5. 在 `/logs` 查看任务日志

## 5. 相关文档

- [设计说明](./docs/设计说明.md)
- [历史 CLI 方案](./docs/archive/DESIGN-cli.md)
- [历史 Express + React 方案](./docs/archive/DESIGN-express-react.md)

## 6. 说明

- 旧的 `GETTING_STARTED.md` 和 `QUICKSTART.md` 已并入本 README
- 端口、脚本和环境变量以 [package.json](./package.json) 和 [.env.example](./.env.example) 为准

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
