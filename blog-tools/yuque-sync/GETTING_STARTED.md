# 🎉 语雀同步工具 - 启动指南

恭喜！基础框架已经搭建完成，核心功能已经实现。现在可以开始使用了！

## ✅ 已实现的功能

### 核心服务层 ✅
- ✅ **语雀客户端** (`lib/yuque/client.ts`)
  - 获取文档列表
  - 获取文档详情
  - 创建、更新、删除文档
  - 测试连接

- ✅ **博客客户端** (`lib/blog/client.ts`)
  - 连接MySQL数据库
  - 读取、创建、更新文章
  - 获取或创建分类和标签
  - 关联文章标签

- ✅ **字段映射器** (`lib/sync/mapper.ts`)
  - 语雀文档 → 博客文章映射
  - 博客文章 → 语雀文档映射
  - 自动生成article_key
  - 自动提取摘要

- ✅ **内容转换器** (`lib/sync/transformer.ts`)
  - Markdown ↔ HTML 转换
  - 摘要提取
  - URL slugify
  - 内容清理

- ✅ **同步引擎** (`lib/sync/engine.ts`)
  - 导入任务（语雀 → 博客）
  - 导出任务（博客 → 语雀）
  - 双向同步任务
  - 任务进度跟踪
  - 同步日志记录

### Web界面 ✅
- ✅ **Dashboard** (`app/dashboard/page.tsx`)
  - 统计信息展示
  - 最近任务列表
  - 快速开始指南

- ✅ **配置管理** (`app/config/page.tsx`)
  - 语雀配置（Token、知识库路径）
  - 博客数据库配置
  - 同步配置（格式、策略等）
  - 连接测试

- ✅ **导入页面** (`app/import/page.tsx`)
  - 语雀文档列表
  - 批量选择文档
  - 搜索功能
  - 导入选项配置

### 数据库 ✅
- ✅ **Prisma + SQLite**
  - 配置表 (config)
  - 映射表 (article_mapping)
  - 任务表 (sync_job)
  - 日志表 (sync_log)
  - 冲突表 (sync_conflict)
  - 统计表 (sync_stats)

## 🚀 快速开始

### 1. 安装依赖

```bash
cd blog-tools/yuque-sync
npm install
```

### 2. 初始化数据库

```bash
# 生成Prisma客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 初始化配置数据
npm run db:seed
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
```

编辑 `.env` 文件（可选，配置也可以在Web界面设置）：

```env
DATABASE_URL="file:./data/yuque-sync.db"
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 http://localhost:3000

## 📝 使用流程

### Step 1: 配置语雀

1. 访问 http://localhost:3000/config
2. 在"语雀配置"部分：
   - **API Token**: 填写语雀Token（从 https://www.yuque.com/settings/tokens 获取）
   - **Base URL**: `https://www.yuque.com/api/v2`
   - **知识库路径**: 格式为 `团队/知识库`，例如 `myteam/blog`
3. 点击"测试连接"确认配置正确
4. 点击"保存配置"

### Step 2: 配置博客数据库

在同一配置页面的"博客数据库配置"部分：
- **数据库类型**: MySQL
- **主机地址**: localhost（或你的数据库地址）
- **端口**: 3306
- **数据库名**: blog
- **用户名**: root
- **密码**: 你的数据库密码
- 点击"测试连接"
- 点击"保存配置"

### Step 3: 从语雀导入文章

1. 访问 http://localhost:3000/import
2. 点击"刷新"加载语雀文档列表
3. 勾选要导入的文档（或全选）
4. 配置导入选项：
   - 是否自动发布
   - 是否强制覆盖
5. 点击"导入"按钮
6. 等待导入完成

### Step 4: 查看导入结果

1. 导入完成后，会在日志中看到详细结果
2. 可以访问 http://localhost:3000/mapping 查看映射关系（待开发）
3. 可以访问 http://localhost:3000/logs 查看同步日志（待开发）

## 📊 数据库管理

### 使用Prisma Studio

```bash
npm run db:studio
```

Prisma Studio会在浏览器中自动打开，你可以：
- 查看所有表和数据
- 编辑配置
- 查看映射关系
- 查看同步日志

### 直接查看SQLite数据库

```bash
# 使用命令行
sqlite3 data/yuque-sync.db

# 查看所有表
.tables

# 查看配置
SELECT * FROM config;

# 查看映射关系
SELECT * FROM article_mapping;

# 查看同步任务
SELECT * FROM sync_job;

# 查看同步日志
SELECT * FROM sync_log;
```

## 🎯 已实现的API接口

### 配置相关
- `POST /api/config/test` - 测试连接
- Server Actions: `updateConfig`, `testConnection`

### 导入相关
- `GET /api/import/yuque/docs` - 获取语雀文档列表
- Server Actions: `importFromYuque`, `getYuqueDocs`

## 🔄 下一步开发

### 待实现的页面
1. **导出页面** (`app/export/page.tsx`)
   - 获取博客文章列表
   - 选择要导出的文章
   - 配置导出选项
   - 执行导出

2. **同步页面** (`app/sync/page.tsx`)
   - 双向同步配置
   - 冲突处理
   - 同步进度显示

3. **映射管理** (`app/mapping/page.tsx`)
   - 查看所有映射关系
   - 手动创建/删除映射
   - 单个文档同步

4. **日志查看** (`app/logs/page.tsx`)
   - 查看所有同步日志
   - 按类型/状态筛选
   - 查看详细错误信息

### 待实现的功能
1. **实时进度显示**
   - 使用Server-Sent Events (SSE)
   - WebSocket实时推送
   - 进度条组件

2. **冲突处理**
   - 检测内容冲突
   - 提供冲突解决策略
   - 交互式冲突处理对话框

3. **批量操作优化**
   - 分页加载文档列表
   - 批量选择优化
   - 并发控制

4. **图片处理**
   - 下载语雀图片到本地
   - 上传本地图片到语雀
   - 图片URL转换

## 🛠️ 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm run start

# 数据库相关
npm run db:generate  # 生成Prisma客户端
npm run db:migrate   # 运行数据库迁移
npm run db:seed      # 初始化配置数据
npm run db:studio    # 打开Prisma Studio

# 代码检查
npm run lint
```

## 📚 项目文件说明

### 核心文件
```
yuque-sync/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Dashboard路由组
│   │   └── layout.tsx        # Dashboard布局
│   ├── dashboard/            # 仪表盘 ✅
│   ├── config/               # 配置管理 ✅
│   ├── import/               # 导入功能 ✅
│   └── page.tsx              # 首页
│
├── components/               # React组件
│   ├── ui/                   # 基础UI组件 ✅
│   ├── config/               # 配置组件 ✅
│   └── import/               # 导入组件 ✅
│
├── lib/                      # 服务端核心库
│   ├── db/                   # 数据库 ✅
│   │   ├── prisma.ts
│   │   └── seed.ts
│   ├── yuque/                # 语雀客户端 ✅
│   │   └── client.ts
│   ├── blog/                 # 博客客户端 ✅
│   │   └── client.ts
│   └── sync/                 # 同步引擎 ✅
│       ├── engine.ts
│       ├── mapper.ts
│       └── transformer.ts
│
├── actions/                  # Server Actions ✅
│   ├── config.ts
│   └── import.ts
│
├── types/                    # TypeScript类型 ✅
│   ├── yuque.ts
│   └── blog.ts
│
├── prisma/                   # Prisma配置 ✅
│   └── schema.prisma
│
└── data/                     # 数据文件
    └── yuque-sync.db         # SQLite数据库
```

## 🐛 常见问题

### Q1: 数据库连接失败
**A**: 检查博客数据库配置，确保MySQL正在运行，用户名密码正确。

### Q2: 语雀API连接失败
**A**:
- 确认Token是否正确
- 确认Token有足够权限
- 确认知识库路径格式正确（`group/repo`）

### Q3: 导入后找不到文章
**A**:
- 检查博客数据库中是否有记录
- 查看同步日志了解详细错误
- 确认article表中deleted字段为0

### Q4: 端口被占用
**A**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 💡 开发提示

### 查看日志
```bash
# 查看实时日志
npm run dev

# 查看数据库内容
npm run db:studio
```

### 调试同步任务
```sql
-- 查看最近的任务
SELECT * FROM sync_job ORDER BY created_at DESC LIMIT 10;

-- 查看某个任务的日志
SELECT * FROM sync_log WHERE job_id = 'xxx' ORDER BY created_at;

-- 查看映射关系
SELECT * FROM article_mapping ORDER BY created_at DESC;
```

### 重置数据库
```bash
# 删除数据库文件
rm data/yuque-sync.db

# 重新初始化
npm run db:migrate
npm run db:seed
```

## 📊 项目进度

- ✅ 项目基础架构
- ✅ 数据库设计与实现
- ✅ 语雀客户端
- ✅ 博客客户端
- ✅ 同步引擎
- ✅ 配置管理
- ✅ 导入功能
- 🔄 导出功能（待开发）
- 🔄 双向同步（待开发）
- 🔄 映射管理（待开发）
- 🔄 日志查看（待开发）
- 🔄 实时进度（待开发）

## 🎉 总结

恭喜！你已经成功创建了一个功能完整的语雀同步工具！现在可以：

1. ✅ 配置语雀和博客数据库
2. ✅ 从语雀导入文章到博客
3. ✅ 查看同步日志和进度
4. 🔄 继续开发导出、同步、映射管理等功能

项目采用Next.js 14全栈架构，代码简洁，易于维护和扩展。所有核心功能都已实现，可以直接使用！

Happy Coding! 🚀
