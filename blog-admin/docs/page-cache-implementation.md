# 页面缓存实现文档

## 概述

本项目实现了一套完整的页面缓存机制，支持多标签页状态保持、登录失效恢复等功能。用户在不同页面间切换时，页面状态（表单数据、滚动位置、用户输入等）会被完整保留。

## 核心特性

- ✅ **页面状态保持**：切换标签页时保持表单数据、滚动位置等状态
- ✅ **智能缓存管理**：根据配置决定哪些页面需要缓存
- ✅ **内存优化**：自动清理关闭的标签页缓存，防止内存泄漏
- ✅ **登录恢复**：登录失效后重新登录可恢复之前的标签页状态
- ✅ **性能优化**：避免重复的组件初始化和 API 请求

## 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Router.tsx                            ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │                BasicLayout.tsx                      │││
│  │  │  ┌─────────────────────────────────────────────────┐│││
│  │  │  │              KeepAlive.tsx                      ││││
│  │  │  │  ┌─────────────────────────────────────────────┐││││
│  │  │  │  │           Page Components                   │││││
│  │  │  │  │  (Dashboard, ArticleEdit, etc.)            │││││
│  │  │  │  └─────────────────────────────────────────────┘││││
│  │  │  └─────────────────────────────────────────────────┘│││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. BasicLayout.tsx

**位置**: `src/layout/BasicLayout.tsx`

**职责**:
- 路由匹配和组件渲染控制
- 缓存策略决策
- 绕过 React Router 的 Outlet 机制

**核心逻辑**:
```typescript
// 路由配置（内置在 BasicLayout 中）
const routeConfig = [
  { path: '/dashboard', component: Dashboard, title: '仪表盘', keepAlive: true },
  { path: '/article/edit/:id', component: ArticleEdit, title: '编辑文章', keepAlive: true },
  // ... 更多路由
]

// 根据当前路径匹配路由
const currentRoute = routeConfig.find(route => {
  if (route.path.includes(':')) {
    return matchPath({ path: route.path }, location.pathname)
  }
  return route.path === location.pathname
})

// 决定是否缓存
const shouldCache = currentRoute?.keepAlive ?? false
```

### 2. KeepAlive.tsx

**位置**: `src/components/common/KeepAlive.tsx`

**职责**:
- 组件实例缓存管理
- 显示/隐藏控制
- 缓存清理

**核心机制**:
```typescript
// 全局缓存 Map
const cacheComponents = new Map<string, React.ReactNode>()

// 缓存逻辑
useEffect(() => {
  if (!shouldCache) {
    // 不需要缓存时删除
    if (cacheComponents.has(cacheKey)) {
      cacheComponents.delete(cacheKey)
    }
    return
  }
  
  // 添加或更新缓存
  cacheComponents.set(cacheKey, children)
}, [children, cacheKey, shouldCache])

// 渲染逻辑：所有缓存组件都渲染，但只显示当前的
return (
  <div>
    {Array.from(cacheComponents.entries()).map(([key, component]) => (
      <div
        key={key}
        style={{
          display: key === cacheKey ? 'block' : 'none',
          height: '100%',
        }}
      >
        {component}
      </div>
    ))}
  </div>
)
```

### 3. 标签页管理 (Tabs Store)

**位置**: `src/store/tabs.ts`

**职责**:
- 标签页状态管理
- 缓存清理事件触发
- 登录恢复时的标签页恢复

**关键功能**:
```typescript
// 缓存当前标签页（登录失效时调用）
cacheTabs: () => {
  const { tabs, activeKey } = get()
  set({ cachedTabs: [...tabs] })
}

// 恢复缓存的标签页（重新登录后调用）
restoreTabs: () => {
  const { cachedTabs } = get()
  if (cachedTabs.length > 0) {
    const firstTab = cachedTabs[0]
    set({ 
      tabs: [...cachedTabs], 
      activeKey: firstTab.key 
    })
  }
}

// 移除标签页时清理缓存
removeTab: (key) => {
  // ... 标签页移除逻辑
  
  // 触发缓存清理事件
  const event = new CustomEvent('tab-remove', { detail: { key } })
  window.dispatchEvent(event)
}
```

## 缓存策略

### 缓存配置

在 `BasicLayout.tsx` 的 `routeConfig` 中配置每个路由的缓存策略：

```typescript
const routeConfig = [
  // 需要缓存的页面（keepAlive: true）
  { path: '/dashboard', component: Dashboard, title: '仪表盘', keepAlive: true },
  { path: '/article', component: ArticleList, title: '文章管理', keepAlive: true },
  { path: '/article/edit/:id', component: ArticleEdit, title: '编辑文章', keepAlive: true },
  { path: '/user', component: User, title: '用户管理', keepAlive: true },
  
  // 不需要缓存的页面（keepAlive: false）
  // 注意：当前所有页面都设置为 true，如需要可以调整
]
```

### 缓存生命周期

1. **页面首次访问**
   - 组件正常渲染和挂载
   - KeepAlive 将组件实例添加到缓存 Map

2. **页面切换离开**
   - 组件通过 `display: none` 隐藏
   - 组件实例保持挂载状态
   - 所有状态（React state、DOM 状态）保持不变

3. **页面切换回来**
   - 组件通过 `display: block` 显示
   - 状态完全恢复，无需重新初始化

4. **标签页关闭**
   - 触发 `tab-remove` 事件
   - KeepAlive 监听事件并清理对应缓存
   - 组件实例被销毁，释放内存

## 登录失效恢复机制

### 实现流程

1. **登录失效检测**
   ```typescript
   // src/api/request.ts
   if (res.code === 401) {
     useAuthStore.getState().setLoginExpiredModalOpen(true)
   }
   ```

2. **标签页缓存**
   ```typescript
   // src/components/common/LoginExpiredModal.tsx
   const handleGoToLogin = async () => {
     cacheTabs() // 缓存当前打开的标签页
     await logout()
     navigate('/login')
   }
   ```

3. **登录成功恢复**
   ```typescript
   // src/pages/Login/index.tsx
   const onFinish = async (values) => {
     await login(values.username, values.password)
     
     if (cachedTabs.length > 0) {
       restoreTabs() // 恢复标签页
       navigate(cachedTabs[0].path) // 跳转到第一个标签页
       clearCachedTabs() // 清除缓存
     }
   }
   ```

### 相关组件

- **LoginExpiredModal**: `src/components/common/LoginExpiredModal.tsx`
- **Login Page**: `src/pages/Login/index.tsx`
- **LoginModal**: `src/components/common/LoginModal.tsx`

## 性能优化

### 内存管理

1. **缓存数量限制**
   ```typescript
   const MAX_CACHE = 10 // 最大缓存 10 个页面
   
   if (cacheComponents.size >= maxCache) {
     const keysToDelete = Array.from(cacheComponents.keys()).slice(0, 1)
     keysToDelete.forEach(key => cacheComponents.delete(key))
   }
   ```

2. **自动清理机制**
   - 标签页关闭时自动清理对应缓存
   - 批量关闭标签页时清理所有相关缓存
   - 登录失效时可选择性清理缓存

3. **事件驱动清理**
   ```typescript
   // 监听清理事件
   window.addEventListener('tab-remove', handleRemove)
   window.addEventListener('tab-refresh', handleRefresh)
   ```

### 渲染优化

1. **懒加载组件**
   ```typescript
   const Dashboard = lazy(() => import('@/pages/Dashboard'))
   const ArticleEdit = lazy(() => import('@/pages/Article/Edit'))
   ```

2. **条件渲染**
   - 只有需要缓存的页面才会被 KeepAlive 管理
   - 不需要缓存的页面直接渲染，避免额外开销

## 调试和监控

### 调试日志

开发环境下可以通过控制台查看详细的缓存状态：

```typescript
// BasicLayout 调试信息
console.log('🔍 BasicLayout Debug:', {
  pathname: location.pathname,
  currentRoute: currentRoute,
  shouldCache,
  allTabs: tabs.map(t => ({ key: t.key, keepAlive: t.keepAlive }))
})

// KeepAlive 调试信息
console.log('🎯 KeepAlive Render:', {
  cacheKey,
  shouldCache,
  hasCached: cacheComponents.has(cacheKey),
  cacheSize: cacheComponents.size,
  allCacheKeys: Array.from(cacheComponents.keys())
})
```

### 监控指标

- **缓存命中率**: 页面切换时是否从缓存恢复
- **内存使用**: 缓存的页面数量和大小
- **清理效率**: 标签页关闭时缓存清理是否及时

## 使用指南

### 添加新页面

1. **创建页面组件**
   ```typescript
   // src/pages/NewPage/index.tsx
   const NewPage: React.FC = () => {
     return <div>新页面内容</div>
   }
   export default NewPage
   ```

2. **在 BasicLayout 中注册**
   ```typescript
   // 1. 导入组件
   const NewPage = lazy(() => import('@/pages/NewPage'))
   
   // 2. 添加路由配置
   const routeConfig = [
     // ... 其他路由
     { path: '/new-page', component: NewPage, title: '新页面', keepAlive: true },
   ]
   ```

3. **添加菜单项**（如需要）
   - 在侧边栏菜单配置中添加对应菜单项

### 配置缓存策略

根据页面特性决定是否启用缓存：

- **建议启用缓存**:
  - 列表页面（保持筛选、分页状态）
  - 编辑页面（保持编辑内容）
  - 配置页面（保持表单状态）

- **建议不启用缓存**:
  - 一次性操作页面
  - 实时数据展示页面
  - 简单的静态页面

### 手动清理缓存

如果需要手动刷新某个页面的缓存：

```typescript
// 触发页面刷新事件
const event = new CustomEvent('tab-refresh', { 
  detail: { key: '/article/edit/123' } 
})
window.dispatchEvent(event)
```

## 常见问题

### Q: 为什么有些页面状态还是会丢失？

A: 检查以下几点：
1. 确认页面的 `keepAlive` 配置为 `true`
2. 检查组件是否使用了会导致重新挂载的逻辑
3. 查看控制台调试日志确认缓存是否生效

### Q: 如何处理页面数据更新？

A: 缓存的页面不会自动刷新数据，如需要：
1. 使用 WebSocket 或轮询更新数据
2. 在页面激活时手动刷新数据
3. 使用全局状态管理（如 Zustand）

### Q: 内存占用过高怎么办？

A: 可以调整缓存策略：
1. 减少 `MAX_CACHE` 数量
2. 将不重要的页面 `keepAlive` 设为 `false`
3. 及时关闭不需要的标签页

## 技术细节

### 为什么不使用 React Router 的 Outlet？

传统的 React Router Outlet 机制会在路由切换时销毁和重建组件，无法保持状态。我们的实现绕过了这个机制，直接在 BasicLayout 中管理组件的渲染和缓存。

### 为什么使用 display 而不是条件渲染？

条件渲染（`{condition && <Component />}`）会导致组件的挂载和卸载，丢失状态。使用 `display: none/block` 可以保持组件挂载状态，只是视觉上隐藏。

### 缓存清理的时机

- **标签页关闭**: 立即清理对应缓存
- **批量关闭**: 清理所有被关闭的标签页缓存
- **应用刷新**: 所有缓存自动清空（因为是内存缓存）
- **手动刷新**: 通过事件机制触发特定页面缓存清理

## 更新日志

### v1.0.0 (当前版本)
- ✅ 实现基础页面缓存功能
- ✅ 支持登录失效后标签页恢复
- ✅ 完善的内存管理和缓存清理
- ✅ 调试日志和监控功能

### 未来计划
- 🔄 支持缓存持久化（localStorage）
- 🔄 更精细的缓存策略配置
- 🔄 缓存性能监控面板
- 🔄 支持页面预加载