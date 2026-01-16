# 语雀同步工具 - 快速开始指南

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

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 http://localhost:3000

## 📝 配置步骤

### Step 1: 获取语雀API Token

1. 访问 https://www.yuque.com/settings/tokens
2. 点击"新建Token"
3. 设置Token名称和权限
4. 复制生成的Token

### Step 2: 配置语雀

1. 访问 http://localhost:3000/config
2. 在"语雀配置"部分填写：
   - **API Token**: 刚才复制的Token
   - **Base URL**: `https://www.yuque.com/api/v2` (默认)
   - **知识库路径**: 格式为 `团队/知识库`，例如 `myteam/blog`
3. 点击"测试连接"确认配置正确
4. 点击"保存配置"

### Step 3: 配置博客数据库

1. 在同一配置页面的"博客数据库配置"部分填写：
   - **数据库类型**: MySQL 或 PostgreSQL
   - **主机地址**: 例如 `localhost`
   - **端口**: 例如 `3306` (MySQL) 或 `5432` (PostgreSQL)
   - **数据库名**: 例如 `blog`
   - **用户名**: 例如 `root`
   - **密码**: 你的数据库密码
2. 点击"测试连接"确认配置正确
3. 点击"保存配置"

### Step 4: 配置同步选项（可选）

在"同步配置"部分可以调整：
- **内容格式**: Markdown、HTML或Lake
- **冲突策略**: 跳过、覆盖、合并或询问
- **自动发布**: 导入时是否自动发布
- **批量大小**: 每次处理的文档数量
- **请求延迟**: 避免API限流

## 💡 基本使用

### 从语雀导入文章

1. 访问 http://localhost:3000/import (待开发)
2. 选择知识库和要导入的文档
3. 配置导入选项（分类、标签等）
4. 点击"开始导入"

### 导出文章到语雀

1. 访问 http://localhost:3000/export (待开发)
2. 选择要导出的博客文章
3. 配置导出选项
4. 点击"开始导出"

### 双向同步

1. 访问 http://localhost:3000/sync (待开发)
2. 选择同步方向
3. 配置冲突处理策略
4. 点击"开始同步"

### 查看映射关系

1. 访问 http://localhost:3000/mapping (待开发)
2. 查看所有博客文章与语雀文档的映射
3. 可以手动创建或删除映射

### 查看同步日志

1. 访问 http://localhost:3000/logs (待开发)
2. 查看所有同步操作的日志
3. 可以按日期、状态等筛选

## 🛠️ 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm run start

# 数据库操作
npm run db:studio    # 打开Prisma Studio（数据库可视化）
npm run db:migrate   # 运行迁移
npm run db:seed      # 初始化配置

# 代码检查
npm run lint
```

## 📂 项目结构

```
yuque-sync/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard路由组
│   │   └── layout.tsx     # Dashboard布局
│   ├── dashboard/         # 仪表盘页面
│   ├── config/            # 配置管理页面
│   ├── import/            # 导入页面（待开发）
│   ├── export/            # 导出页面（待开发）
│   ├── sync/              # 同步页面（待开发）
│   ├── mapping/           # 映射管理（待开发）
│   └── logs/              # 日志查看（待开发）
│
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   └── config/           # 配置相关组件
│
├── lib/                  # 核心库（服务端）
│   ├── db/              # 数据库相关
│   ├── yuque/           # 语雀服务（待开发）
│   ├── blog/            # 博客服务（待开发）
│   └── sync/            # 同步引擎（待开发）
│
├── actions/             # Server Actions
│   └── config.ts        # 配置相关操作
│
├── prisma/             # Prisma配置
│   └── schema.prisma   # 数据库Schema
│
└── data/              # 数据文件
    └── yuque-sync.db # SQLite数据库
```

## 🔧 故障排除

### 问题1: 数据库连接失败

**解决方案**:
- 检查博客数据库是否运行
- 确认连接信息（主机、端口、用户名、密码）是否正确
- 检查数据库用户是否有足够权限

### 问题2: 语雀API连接失败

**解决方案**:
- 确认Token是否正确且未过期
- 检查知识库路径格式是否正确
- 确认Token有足够的权限

### 问题3: 端口被占用

**解决方案**:
```bash
# Windows
netstat -ano | findstr :3000
# 找到进程ID后
taskkill /PID <进程ID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 📊 数据库管理

### 使用Prisma Studio

```bash
npm run db:studio
```

Prisma Studio会在浏览器中打开，你可以：
- 查看所有表和数据
- 手动编辑数据
- 添加、删除记录

### 直接访问SQLite

```bash
# 使用SQLite命令行
sqlite3 data/yuque-sync.db

# 常用查询
.tables              # 查看所有表
SELECT * FROM config;  # 查看配置
SELECT * FROM article_mapping;  # 查看映射关系
SELECT * FROM sync_job;  # 查看同步任务
```

## 🎯 下一步

项目基础框架已经搭建完成，接下来需要实现：

### 核心功能（优先级高）
- [ ] 语雀客户端（lib/yuque/client.ts）
- [ ] 博客客户端（lib/blog/client.ts）
- [ ] 同步引擎（lib/sync/engine.ts）
- [ ] 导入功能（app/import/page.tsx）
- [ ] 导出功能（app/export/page.tsx）
- [ ] 同步功能（app/sync/page.tsx）

### 辅助功能（优先级中）
- [ ] 映射管理（app/mapping/page.tsx）
- [ ] 日志查看（app/logs/page.tsx）
- [ ] 实时进度显示
- [ ] 冲突处理对话框

### 优化功能（优先级低）
- [ ] 批量操作
- [ ] 定时任务
- [ ] 统计图表
- [ ] 导出日志

## 📚 更多文档

- [完整设计文档](./DESIGN_NEXTJS.md)
- [语雀API文档](../../yuque-tool/docs/yuque_openapi_20251121_green.yaml)
- [Prisma文档](https://www.prisma.io/docs)
- [Next.js文档](https://nextjs.org/docs)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
