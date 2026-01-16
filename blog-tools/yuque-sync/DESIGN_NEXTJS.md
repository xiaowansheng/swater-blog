# 语雀同步工具 - Next.js 全栈方案

## 1. 技术栈选择

### 为什么选择 Next.js？

| 特性 | Next.js 全栈 | 分离方案 (Express + React) |
|------|------------|-------------------------|
| 项目数量 | 1个 | 2个 |
| 类型共享 | ✅ 完美共享 | ❌ 需要额外配置 |
| 开发体验 | ✅ 热重载全栈 | ⚠️ 需要启动两个服务 |
| 部署难度 | ✅ 一键部署 | ❌ 需要分别部署 |
| 代码量 | ✅ 更少 | ❌ 重复代码多 |
| 学习曲线 | ✅ 统一技术栈 | ❌ 需要学习两套 |
| 性能 | ✅ SSR/SSG | ⚠️ 纯CSR |

### 核心技术

```yaml
框架: Next.js 14 (App Router)
运行时: Node.js 18+
语言: TypeScript
UI库: Ant Design 5
状态管理: React Server Components + Zustand
数据库: Prisma + SQLite
API: Next.js API Routes / Server Actions
实时通信: Server-Sent Events (SSE) / Polling
表单处理: React Hook Form + Zod
样式: Tailwind CSS
部署: Vercel / Docker
```

## 2. 项目结构

```
yuque-sync/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由组
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/              # 主应用路由组
│   │   ├── layout.tsx            # Dashboard布局
│   │   ├── page.tsx              # 仪表盘
│   │   ├── config/               # 配置管理
│   │   │   └── page.tsx
│   │   ├── import/               # 导入
│   │   │   └── page.tsx
│   │   ├── export/               # 导出
│   │   │   └── page.tsx
│   │   ├── sync/                 # 同步
│   │   │   └── page.tsx
│   │   ├── mapping/              # 映射管理
│   │   │   └── page.tsx
│   │   └── logs/                 # 日志
│   │       └── page.tsx
│   ├── api/                      # API Routes
│   │   ├── config/
│   │   │   └── route.ts
│   │   ├── sync/
│   │   │   ├── route.ts          # GET/POST 同步任务
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET/DELETE 任务详情
│   │   ├── import/
│   │   │   ├── yuque/
│   │   │   │   └── docs/route.ts # GET 获取语雀文档
│   │   │   ├── preview/route.ts  # POST 预览导入
│   │   │   └── execute/route.ts  # POST 执行导入
│   │   ├── export/
│   │   │   ├── blog/
│   │   │   │   └── articles/route.ts  # GET 获取博客文章
│   │   │   ├── preview/route.ts  # POST 预览导出
│   │   │   └── execute/route.ts  # POST 执行导出
│   │   ├── mapping/
│   │   │   └── route.ts
│   │   └── logs/
│   │       └── route.ts
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页（重定向到dashboard）
│   ├── globals.css               # 全局样式
│   └── error.tsx                 # 错误页面
│
├── components/                   # React组件
│   ├── ui/                       # 基础UI组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── dashboard/                # 仪表盘组件
│   │   ├── StatCard.tsx
│   │   ├── RecentJobs.tsx
│   │   └── SyncChart.tsx
│   ├── config/                   # 配置组件
│   │   ├── YuqueConfigForm.tsx
│   │   ├── BlogConfigForm.tsx
│   │   └── SyncConfigForm.tsx
│   ├── sync/                     # 同步组件
│   │   ├── SyncProgress.tsx
│   │   ├── SyncOptions.tsx
│   │   └── ConflictDialog.tsx
│   ├── import/                   # 导入组件
│   │   ├── YuqueDocList.tsx
│   │   ├── ImportOptions.tsx
│   │   └── ImportPreview.tsx
│   ├── export/                   # 导出组件
│   │   ├── BlogArticleList.tsx
│   │   ├── ExportOptions.tsx
│   │   └── ExportPreview.tsx
│   ├── mapping/                  # 映射组件
│   │   ├── MappingTable.tsx
│   │   └── MappingForm.tsx
│   └── logs/                     # 日志组件
│       ├── LogList.tsx
│       ├── LogFilter.tsx
│       └── LogDetail.tsx
│
├── lib/                          # 核心库（服务端）
│   ├── db/                       # 数据库
│   │   ├── prisma.ts             # Prisma客户端
│   │   └── seed.ts               # 初始化数据
│   ├── yuque/                    # 语雀服务
│   │   ├── client.ts             # API客户端
│   │   ├── types.ts              # 类型定义
│   │   └── helpers.ts            # 辅助函数
│   ├── blog/                     # 博客服务
│   │   ├── client.ts             # 数据库客户端
│   │   ├── types.ts              # 类型定义
│   │   └── helpers.ts
│   ├── sync/                     # 同步服务
│   │   ├── engine.ts             # 同步引擎
│   │   ├── mapper.ts             # 字段映射
│   │   ├── transformer.ts        # 内容转换
│   │   ├── conflict.ts           # 冲突解决
│   │   └── queue.ts              # 任务队列
│   ├── config/                   # 配置管理
│   │   ├── store.ts              # 配置存储
│   │   ├── schema.ts             # 配置Schema
│   │   └── validation.ts         # 配置验证
│   └── utils/                    # 工具函数
│       ├── logger.ts
│       ├── date.ts
│       └── format.ts
│
├── actions/                      # Server Actions
│   ├── config.ts                 # 配置相关
│   ├── sync.ts                   # 同步操作
│   ├── import.ts                 # 导入操作
│   ├── export.ts                 # 导出操作
│   ├── mapping.ts                # 映射操作
│   └── logs.ts                   # 日志查询
│
├── hooks/                        # React Hooks
│   ├── use-sync-progress.ts      # 同步进度
│   ├── use-yuque-docs.ts         # 语雀文档
│   ├── use-blog-articles.ts      # 博客文章
│   └── use-config.ts             # 配置
│
├── types/                        # TypeScript类型
│   ├── config.ts
│   ├── sync.ts
│   ├── yuque.ts
│   ├── blog.ts
│   └── api.ts
│
├── prisma/                       # Prisma配置
│   ├── schema.prisma             # 数据库Schema
│   └── migrations/               # 迁移文件
│
├── public/                       # 静态资源
│   └── images/
│
├── data/                         # 数据目录
│   └── yuque-sync.db             # SQLite数据库
│
├── styles/                       # 样式文件
│   └── globals.css
│
├── middleware.ts                 # Next.js中间件
├── next.config.js                # Next.js配置
├── tailwind.config.ts            # Tailwind配置
├── tsconfig.json                 # TypeScript配置
├── package.json
├── Dockerfile
└── README.md
```

## 3. 数据库Schema（与之前相同）

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:../data/yuque-sync.db"
}

// ... (与DESIGN_V2.md中相同的Schema)
```

## 4. 核心实现

### 4.1 Server Actions（替代API Routes）

```typescript
// app/actions/sync.ts

'use server';

import { revalidatePath } from 'next/cache';
import { syncEngine } from '@/lib/sync/engine';
import { logger } from '@/lib/utils/logger';

export interface SyncOptions {
  type: 'import' | 'export' | 'sync';
  direction: 'yuque_to_blog' | 'blog_to_yuque' | 'bidirectional';
  docIds?: string[];
  articleIds?: number[];
  options?: {
    publish?: boolean;
    force?: boolean;
    conflictStrategy?: 'skip' | 'overwrite' | 'merge';
  };
}

export interface SyncResult {
  success: boolean;
  jobId: string;
  message?: string;
}

/**
 * 创建同步任务
 */
export async function createSyncJob(options: SyncOptions): Promise<SyncResult> {
  try {
    const jobId = await syncEngine.createJob(options);
    logger.info(`Sync job created: ${jobId}`);

    // 异步执行同步
    syncEngine.executeJob(jobId).catch(error => {
      logger.error(`Sync job failed: ${jobId}`, error);
    });

    revalidatePath('/dashboard');
    revalidatePath('/sync');

    return {
      success: true,
      jobId,
      message: '同步任务已创建',
    };
  } catch (error) {
    logger.error('Failed to create sync job', error);
    return {
      success: false,
      jobId: '',
      message: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 获取同步任务状态
 */
export async function getSyncJobStatus(jobId: string) {
  return await syncEngine.getJobStatus(jobId);
}

/**
 * 取消同步任务
 */
export async function cancelSyncJob(jobId: string) {
  return await syncEngine.cancelJob(jobId);
}
```

### 4.2 页面组件（Server Components）

```typescript
// app/(dashboard)/sync/page.tsx

import { Suspense } from 'react';
import { SyncProgress } from '@/components/sync/SyncProgress';
import { SyncOptions } from '@/components/sync/SyncOptions';
import { RecentConflicts } from '@/components/sync/RecentConflicts';
import { getRecentConflicts } from '@/lib/sync/conflict';

export const dynamic = 'force-dynamic';

export default async function SyncPage() {
  const conflicts = await getRecentConflicts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">双向同步</h1>
        <p className="text-muted-foreground mt-2">
          在博客和语雀之间同步文章
        </p>
      </div>

      <SyncOptions />

      <Suspense fallback={<div>加载中...</div>}>
        {conflicts.length > 0 && <RecentConflicts conflicts={conflicts} />}
      </Suspense>

      <SyncProgress />
    </div>
  );
}
```

### 4.3 客户端组件（交互）

```typescript
// components/sync/SyncOptions.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createSyncJob } from '@/app/actions/sync';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SyncOptions() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [direction, setDirection] = useState<string>('bidirectional');
  const [force, setForce] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await createSyncJob({
        type: 'sync',
        direction: direction as any,
        options: {
          force,
          conflictStrategy: 'skip',
        },
      });

      if (result.success) {
        toast.success('同步任务已创建');
        router.push(`/sync/job/${result.jobId}`);
      } else {
        toast.error(result.message || '创建同步任务失败');
      }
    } catch (error) {
      toast.error('操作失败');
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>同步配置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>同步方向</Label>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yuque_to_blog">
                  语雀 → 博客
                </SelectItem>
                <SelectItem value="blog_to_yuque">
                  博客 → 语雀
                </SelectItem>
                <SelectItem value="bidirectional">
                  双向同步
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>强制覆盖</Label>
            <Switch checked={force} onCheckedChange={setForce} />
          </div>

          <Button
            onClick={handleSync}
            disabled={syncing}
            className="w-full"
          >
            {syncing ? '创建中...' : '开始同步'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.4 实时进度（Server-Sent Events）

```typescript
// app/api/sync/[id]/progress/route.ts

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // 发送初始状态
      const initialStatus = await getJobStatus(jobId);
      sendEvent(initialStatus);

      // 轮询更新
      const interval = setInterval(async () => {
        const status = await getJobStatus(jobId);
        sendEvent(status);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

```typescript
// hooks/use-sync-progress.ts

'use client';

import { useEffect, useState } from 'react';

interface SyncProgress {
  status: 'pending' | 'running' | 'completed' | 'failed';
  total: number;
  processed: number;
  success: number;
  failed: number;
  currentItem?: {
    id: string;
    name: string;
  };
}

export function useSyncProgress(jobId: string) {
  const [progress, setProgress] = useState<SyncProgress | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/sync/${jobId}/progress`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  return progress;
}
```

## 5. 配置管理

### 5.1 配置存储

```typescript
// lib/config/store.ts

import { prisma } from '@/lib/db/prisma';

export interface Config {
  yuque: {
    token: string;
    baseUrl: string;
    namespace: string;
  };
  blog: {
    type: 'mysql' | 'postgresql';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  sync: {
    format: 'markdown' | 'html' | 'lake';
    conflictStrategy: 'skip' | 'overwrite' | 'merge' | 'ask';
    autoPublish: boolean;
    batchSize: number;
    delayBetweenRequests: number;
  };
}

export async function getConfig(): Promise<Config> {
  const configs = await prisma.config.findMany();

  const toObject = (category: string) => {
    return configs
      .filter(c => c.category === category)
      .reduce((acc, c) => {
        acc[c.key.split('.')[1]] = c.value;
        return acc;
      }, {} as any);
  };

  return {
    yuque: toObject('yuque'),
    blog: toObject('blog'),
    sync: toObject('sync'),
  };
}

export async function updateConfig(category: string, data: any) {
  const operations = Object.entries(data).map(([key, value]) => {
    return prisma.config.upsert({
      where: { key: `${category}.${key}` },
      update: { value: String(value) },
      create: {
        key: `${category}.${key}`,
        value: String(value),
        category,
      },
    });
  });

  await prisma.$transaction(operations);
}
```

### 5.2 配置页面

```typescript
// app/(dashboard)/config/page.tsx

import { ConfigForm } from '@/components/config/ConfigForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getConfig } from '@/lib/config/store';

export default async function ConfigPage() {
  const config = await getConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">配置管理</h1>
        <p className="text-muted-foreground mt-2">
          配置语雀API、博客数据库和同步选项
        </p>
      </div>

      <Tabs defaultValue="yuque">
        <TabsList>
          <TabsTrigger value="yuque">语雀配置</TabsTrigger>
          <TabsTrigger value="blog">博客数据库</TabsTrigger>
          <TabsTrigger value="sync">同步配置</TabsTrigger>
        </TabsList>

        <TabsContent value="yuque">
          <ConfigForm
            category="yuque"
            initialValues={config.yuque}
            fields={[
              { name: 'token', label: 'API Token', type: 'password', required: true },
              { name: 'baseUrl', label: 'Base URL', type: 'text', required: true },
              { name: 'namespace', label: '知识库路径', type: 'text', required: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="blog">
          <ConfigForm
            category="blog"
            initialValues={config.blog}
            fields={[
              { name: 'type', label: '数据库类型', type: 'select', options: ['mysql', 'postgresql'] },
              { name: 'host', label: '主机地址', type: 'text' },
              { name: 'port', label: '端口', type: 'number' },
              { name: 'database', label: '数据库名', type: 'text' },
              { name: 'username', label: '用户名', type: 'text' },
              { name: 'password', label: '密码', type: 'password' },
            ]}
          />
        </TabsContent>

        <TabsContent value="sync">
          <ConfigForm
            category="sync"
            initialValues={config.sync}
            fields={[
              { name: 'format', label: '内容格式', type: 'select', options: ['markdown', 'html', 'lake'] },
              { name: 'conflictStrategy', label: '冲突策略', type: 'select', options: ['skip', 'overwrite', 'merge', 'ask'] },
              { name: 'autoPublish', label: '自动发布', type: 'checkbox' },
              { name: 'batchSize', label: '批量大小', type: 'number' },
              { name: 'delayBetweenRequests', label: '请求延迟(ms)', type: 'number' },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 6. UI组件库选择

### 选项1: Shadcn/ui（推荐）

```bash
# 零依赖、完全可定制、基于Radix UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select switch
```

### 选项2: Ant Design

```bash
# 功能丰富、企业级、中文友好
npm install antd @ant-design/icons
```

### 选项3: 混合使用

- Shadcn/ui 用于基础组件
- Ant Design 用于复杂组件（Table、Form等）

## 7. package.json

```json
{
  "name": "yuque-sync",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.7.0",
    "axios": "^1.6.2",
    "dayjs": "^1.11.10",
    "marked": "^11.1.0",
    "turndown": "^7.1.2",
    "slugify": "^1.6.6",
    "sonner": "^1.3.1",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "prisma": "^5.7.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "tsx": "^4.7.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4"
  }
}
```

## 8. 部署

### 8.1 Vercel部署（最简单）

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 设置环境变量
vercel env add DATABASE_URL
vercel env add YUQUE_TOKEN
```

### 8.2 Docker部署

```dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 运行应用
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/data ./data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

## 9. 开发流程

### Phase 1: 基础搭建（1天）
- [x] 创建Next.js项目
- [ ] 配置Prisma + SQLite
- [ ] 设置Shadcn/ui
- [ ] 创建基础布局

### Phase 2: 核心功能（3天）
- [ ] 实现配置管理
- [ ] 实现语雀客户端
- [ ] 实现博客客户端
- [ ] 实现同步引擎

### Phase 3: 页面开发（3天）
- [ ] 配置页面
- [ ] 导入页面
- [ ] 导出页面
- [ ] 同步页面
- [ ] 映射管理页面
- [ ] 日志查看页面

### Phase 4: 优化完善（2天）
- [ ] 实时进度
- [ ] 错误处理
- [ ] 性能优化
- [ ] 测试

## 10. 对比总结

| 特性 | Next.js全栈 | Express+React分离 |
|------|-----------|-----------------|
| 文件数量 | ~150 | ~250 |
| 代码行数 | ~8000 | ~12000 |
| 开发时间 | 8天 | 12天 |
| 部署复杂度 | 低 | 中 |
| 维护成本 | 低 | 中 |
| 类型安全 | ✅ 完美 | ⚠️ 需要努力 |

**结论：Next.js 全栈方案是最佳选择！**
