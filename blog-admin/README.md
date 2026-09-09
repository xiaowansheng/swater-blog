# 博客后台管理系统

基于 React 18 + TypeScript + Vite 构建的博客后台管理端（blog-admin），配合 [blog-service](../blog-service) 后端工作。

## 技术栈

- **框架**: React 18 + TypeScript（strict）
- **构建工具**: Vite 6（生产构建剔除 console/debugger，按 vendor 拆分 chunk）
- **UI 组件**: Ant Design 5 + Tailwind CSS
- **状态管理**: Zustand（auth / tabs / websocket / notification / lockscreen）
- **路由**: React Router 6（中央路由表 + 懒加载 + react-activation 页面保活）
- **HTTP 客户端**: Axios（统一 Result 解包与 401/403 拦截）
- **编辑器**: vditor（Markdown）+ wangEditor（富文本）
- **图表**: ECharts
- **实时通信**: WebSocket（通知推送，心跳 + 指数退避重连）
- **测试**: Vitest

## 架构要点

### 认证与安全

- 真实 token 存于 httpOnly Cookie，前端 JS 不可读；另设非 httpOnly 的 `blog_admin_logged_in` 标记 Cookie（仅 0/1）供前端同步判断登录态
- 密码使用服务端下发的公钥做 RSA-OAEP-SHA256 加密并携带 nonce，明文不出前端
- 401 统一由 axios 拦截器弹出登录过期弹窗，重新登录后恢复挂起前的标签页
- 30 分钟无操作自动锁屏

### 路由与权限

- `src/config/routes.ts` 是唯一数据源：路由注册、懒加载、标签页标题、保活开关、侧边栏菜单（`icon` + `group`）、角色权限（`roles`）全部由路由表驱动
- 带 `icon` 的路由出现在侧边栏；`group` 决定所属分组，无 `group` 为顶级项；子页面/动作页不设 `icon`
- 系统管理、监控管理类路由要求 `admin` 角色（roleKey），路由守卫越权重定向回欢迎页，侧边栏同步隐藏
- 多标签页体系：打开页面自动注册标签，标签的移除/刷新与 KeepAlive 缓存通过 `tab-remove`/`tab-refresh` 事件联动

### 请求层

`src/api/request.ts` 统一处理后端 `Result<T>` 包裹协议：业务码 200 解包数据，401 弹登录过期，403 提示无权限，网络异常统一提示。业务组件只拿解包后的数据。

## 功能模块

- **首页**: 欢迎页、仪表盘（访问趋势、发布趋势、设备/浏览器分布）
- **内容管理**: 文章（列表/编辑/导入/导出/归类树/可视化）、分类、标签、说说、归档
- **互动管理**: 评论、留言、友链
- **媒体管理**: 文件、相册
- **系统管理**（仅 admin 角色）: 用户、角色、菜单、接口、系统配置、关于页面
- **监控管理**（仅 admin 角色）: 访客统计、操作日志、异常日志
- **其他**: 通知管理（WebSocket 实时推送）、个人中心

## 项目结构

```
blog-admin/
├── src/
│   ├── api/              # 按领域拆分的 API 模块 + axios 实例
│   ├── components/       # 公共组件（编辑器、上传、图表等）
│   ├── config/           # 路由表（菜单/权限/保活一体）+ 应用配置
│   ├── hooks/            # 自定义 Hooks（WebSocket、自动锁屏、自动保存等）
│   ├── layout/           # 布局（侧边栏/头部/标签页，菜单由路由表派生）
│   ├── pages/            # 页面组件（大型页面按 components/ 子目录拆分）
│   ├── router/           # 路由守卫（登录态 + 角色权限）
│   ├── store/            # Zustand 全局状态
│   ├── styles/           # 全局样式
│   ├── test/             # 测试环境设置（浏览器 API 桩）
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数（加解密、存储、格式化、标签导航等）
│   └── websocket/        # WebSocket 通知客户端
├── docs/                 # 项目文档
├── nginx.conf            # 生产 Nginx 配置
├── security-headers.conf # 安全响应头
├── Dockerfile
└── vite.config.ts        # 含 Vitest 配置
```

## 开发

```bash
pnpm install

# 启动开发服务器（默认 http://localhost:3000，/api 与 /ws 代理到 localhost:8888）
pnpm dev

# 类型检查 + 生产构建
pnpm build

# 单元测试
pnpm test

# 代码检查
pnpm lint
```

## 环境配置

复制 `.env.example` 为 `.env.local` 按需覆盖，主要配置项：

- `VITE_API_BASE_URL` - API 基础路径（默认 `/api`）
- `VITE_WS_BASE_URL` - WebSocket 地址（留空则按页面协议/域名自动生成）
- `VITE_UPLOAD_RESOURCE_PREFIX` - 资源访问前缀
- `VITE_STORAGE_PREFIX` - localStorage key 前缀（开发环境为 `blog_admin_dev_`）

如需修改端口或代理目标，查看 `vite.config.ts`。

## 相关文档

- [页面缓存机制](./docs/页面缓存机制.md)

## API 对接

后端 API 基础路径: `/api`，主要接口前缀：

- `/api/auth` - 认证（登录、nonce、邮箱验证码、当前用户）
- `/api/admin/post` - 文章管理
- `/api/admin/category` / `/api/admin/tag` - 分类、标签
- `/api/admin/comment` / `/api/admin/guestbook` - 评论、留言
- `/api/admin/user` / `/api/admin/role` / `/api/admin/menu` - 用户、角色、菜单
- `/api/admin/visitor` / `/api/admin/log` - 访客、日志
- `/api/admin/album` / `/api/admin/file` - 相册、文件
- `/api/admin/about` - 关于页面
- `/api/public/menu/current` - 当前用户菜单（RBAC 数据）
