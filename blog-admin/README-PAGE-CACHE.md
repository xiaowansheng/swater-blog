# 页面缓存功能说明

## 功能概述

本项目实现了完整的页面缓存机制，支持：
- 📄 **页面状态保持** - 切换标签页时保持表单数据、滚动位置等
- 🔄 **登录恢复** - 登录失效后重新登录可恢复之前的标签页
- 🧹 **智能清理** - 自动清理关闭的标签页缓存，防止内存泄漏
- ⚡ **性能优化** - 避免重复的组件初始化和 API 请求

## 快速开始

### 用户体验

1. **编辑文章时**，填写表单内容
2. **切换到其他标签页**（如用户管理）
3. **再切换回文章编辑**，所有内容都还在！

### 开发者配置

在 `src/layout/BasicLayout.tsx` 中配置页面缓存：

```typescript
const routeConfig = [
  // 启用缓存的页面
  { path: '/article/edit/:id', component: ArticleEdit, title: '编辑文章', keepAlive: true },
  { path: '/dashboard', component: Dashboard, title: '仪表盘', keepAlive: true },
  
  // 不缓存的页面
  { path: '/simple-page', component: SimplePage, title: '简单页面', keepAlive: false },
]
```

## 核心文件

```
blog-admin/
├── src/
│   ├── layout/
│   │   └── BasicLayout.tsx          # 🎯 核心控制器
│   ├── components/common/
│   │   ├── KeepAlive.tsx           # 🗄️ 缓存管理器
│   │   └── LoginExpiredModal.tsx   # 🔐 登录失效处理
│   ├── store/
│   │   └── tabs.ts                 # 📑 标签页状态管理
│   └── router/
│       └── index.tsx               # 🛣️ 简化的路由配置
└── docs/
    └── page-cache-implementation.md # 📚 详细技术文档
```

## 工作原理

### 传统方式 ❌
```
页面A → 页面B → 页面A
  ↓       ↓       ↓
挂载    销毁A     重新挂载A
       挂载B     (状态丢失)
```

### 我们的方式 ✅
```
页面A → 页面B → 页面A
  ↓       ↓       ↓
挂载    隐藏A     显示A
       挂载B     (状态保持)
```

## 调试

打开浏览器控制台，可以看到详细的缓存状态：

```
🔍 BasicLayout Debug: {
  pathname: "/article/edit/123",
  shouldCache: true,
  allTabs: [...]
}

🎯 KeepAlive Render: {
  cacheKey: "/article/edit/123",
  cacheSize: 3,
  allCacheKeys: ["/dashboard", "/article", "/article/edit/123"]
}
```

## 常见问题

**Q: 页面数据不是最新的怎么办？**
A: 缓存页面不会自动刷新数据，可以：
- 使用 WebSocket 实时更新
- 在页面激活时手动刷新
- 右键标签页选择"刷新"

**Q: 内存占用会不会很高？**
A: 不会，我们有完善的清理机制：
- 最多缓存 10 个页面
- 关闭标签页时自动清理
- 登录失效时可选择清理

**Q: 如何添加新页面？**
A: 在 `BasicLayout.tsx` 的 `routeConfig` 中添加配置即可。

## 详细文档

查看 [完整技术文档](./docs/page-cache-implementation.md) 了解更多实现细节。