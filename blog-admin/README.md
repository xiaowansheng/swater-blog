# 博客后台管理系统

基于 React + TypeScript + Ant Design + Tailwind CSS 构建的现代化博客后台管理系统。

## 技术栈

- **框架**: React 18 + TypeScript
- **UI组件**: Ant Design 5
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router 6
- **HTTP客户端**: Axios
- **图表**: ECharts
- **Markdown编辑器**: @uiw/react-md-editor
- **构建工具**: Vite

## 功能模块

### 仪表盘
- 数据统计卡片（文章数、评论数、访客数、今日访问）
- 访问量趋势图
- 文章发布趋势图
- 设备分布饼图
- 浏览器统计柱状图

### 内容管理
- **文章管理**: 文章列表、创建、编辑、发布/下架、批量删除
- **分类管理**: 分类的增删改查
- **标签管理**: 标签的增删改查，支持自定义颜色
- **说说管理**: 动态说说的管理

### 互动管理
- **评论管理**: 评论审核、通过/拒绝、删除
- **留言管理**: 留言审核、通过/拒绝、删除
- **友链管理**: 友情链接的增删改查

### 媒体管理
- **文件管理**: 文件上传、预览、删除
- **相册管理**: 相册的增删改查，图片管理

### 系统管理
- **用户管理**: 用户的增删改查、角色分配、密码重置
- **角色管理**: 角色的增删改查、权限配置
- **菜单管理**: 菜单的增删改查
- **系统配置**: 系统参数配置
- **关于页面**: 关于页面内容编辑

### 监控管理
- **访客统计**: 访客列表、统计图表
- **操作日志**: 系统操作日志查看
- **异常日志**: 系统异常日志查看

### 通知管理
- 系统通知的查看和管理
- WebSocket实时通知

## 项目结构

```
blog-admin/
├── src/
│   ├── api/              # API接口
│   ├── components/       # 公共组件
│   │   ├── Chart/        # 图表组件
│   │   └── common/       # 通用组件
│   ├── hooks/            # 自定义Hooks
│   ├── layout/           # 布局组件
│   │   └── components/   # 布局子组件
│   ├── pages/            # 页面组件
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── styles/           # 全局样式
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   └── websocket/        # WebSocket
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 开发

```bash
# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev
# 或
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 环境配置

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

主要配置项：
- `VITE_API_BASE_URL` - API基础路径

默认开发端口：`http://localhost:3000`  
如需修改端口或代理配置，请查看 `vite.config.ts`。

## API对接

后端API基础路径: `/api`

主要接口前缀:
- `/api/auth` - 认证相关
- `/api/admin/post` - 文章管理
- `/api/admin/category` - 分类管理
- `/api/admin/tag` - 标签管理
- `/api/admin/comment` - 评论管理
- `/api/admin/user` - 用户管理
- `/api/admin/role` - 角色管理
- `/api/admin/visitor` - 访客管理
- `/api/admin/album` - 相册管理
- `/api/admin/guestbook` - 留言管理
- `/api/admin/about` - 关于页面
