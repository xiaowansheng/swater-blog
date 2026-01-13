# 页面缓存 - 开发者快速参考

## 🚀 添加新页面

### 1. 创建页面组件
```typescript
// src/pages/MyNewPage/index.tsx
import React from 'react'

const MyNewPage: React.FC = () => {
  return (
    <div>
      <h1>我的新页面</h1>
      {/* 页面内容 */}
    </div>
  )
}

export default MyNewPage
```

### 2. 注册到路由配置
```typescript
// src/layout/BasicLayout.tsx

// 1. 导入组件
const MyNewPage = lazy(() => import('@/pages/MyNewPage'))

// 2. 添加到 routeConfig
const routeConfig = [
  // ... 其他路由
  { 
    path: '/my-new-page', 
    component: MyNewPage, 
    title: '我的新页面', 
    keepAlive: true  // 是否启用缓存
  },
]
```

## 🎛️ 缓存配置

### 启用缓存 (keepAlive: true)
适用于：
- 📝 编辑页面（保持编辑内容）
- 📋 列表页面（保持筛选、分页）
- ⚙️ 配置页面（保持表单状态）

### 禁用缓存 (keepAlive: false)
适用于：
- 📊 实时数据页面
- 🔄 一次性操作页面
- 📄 简单静态页面

## 🛠️ 常用操作

### 手动刷新页面缓存
```typescript
// 刷新当前页面缓存
const refreshCurrentPage = () => {
  const event = new CustomEvent('tab-refresh', { 
    detail: { key: location.pathname } 
  })
  window.dispatchEvent(event)
}

// 刷新指定页面缓存
const refreshPage = (path: string) => {
  const event = new CustomEvent('tab-refresh', { 
    detail: { key: path } 
  })
  window.dispatchEvent(event)
}
```

### 获取缓存状态
```typescript
// 在组件中获取标签页状态
import { useTabsStore } from '@/store/tabs'

const MyComponent = () => {
  const { tabs, activeKey } = useTabsStore()
  
  console.log('当前标签页:', activeKey)
  console.log('所有标签页:', tabs)
}
```

### 程序化操作标签页
```typescript
import { useTabsStore } from '@/store/tabs'

const { addTab, removeTab, setActiveTab } = useTabsStore()

// 添加标签页
addTab({
  key: '/new-page',
  label: '新页面',
  path: '/new-page',
  closable: true,
  keepAlive: true
})

// 关闭标签页
removeTab('/some-page')

// 切换到指定标签页
setActiveTab('/dashboard')
```

## 🐛 调试技巧

### 查看缓存状态
```typescript
// 在浏览器控制台执行
console.log('当前缓存的页面:', Array.from(cacheComponents.keys()))
```

### 启用详细日志
在 `KeepAlive.tsx` 和 `BasicLayout.tsx` 中已包含调试日志，打开控制台即可查看。

### 检查页面是否被缓存
```typescript
// 在页面组件中添加生命周期日志
useEffect(() => {
  console.log('页面挂载:', location.pathname)
  return () => {
    console.log('页面卸载:', location.pathname)
  }
}, [])
```

## 🔧 性能优化

### 减少缓存数量
```typescript
// src/components/common/KeepAlive.tsx
const MAX_CACHE = 5 // 调整最大缓存数量
```

### 选择性缓存
```typescript
// 只对重要页面启用缓存
const routeConfig = [
  { path: '/dashboard', keepAlive: true },      // 重要：仪表盘
  { path: '/article/edit/:id', keepAlive: true }, // 重要：编辑页面
  { path: '/simple-info', keepAlive: false },   // 不重要：简单信息页
]
```

## 🚨 注意事项

### 1. 数据更新问题
缓存的页面不会自动刷新数据，需要：
```typescript
// 方案1: 监听页面激活事件
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // 页面激活时刷新数据
      fetchData()
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [])

// 方案2: 使用全局状态管理
// 通过 Zustand store 管理数据，多个页面共享状态
```

### 2. 内存管理
```typescript
// 及时清理不需要的事件监听器
useEffect(() => {
  const handleSomeEvent = () => { /* ... */ }
  
  window.addEventListener('some-event', handleSomeEvent)
  return () => {
    window.removeEventListener('some-event', handleSomeEvent)
  }
}, [])
```

### 3. 路由参数变化
```typescript
// 对于带参数的路由，确保参数变化时正确处理
useEffect(() => {
  // 当路由参数变化时重新获取数据
  if (id) {
    fetchArticle(id)
  }
}, [id]) // 依赖路由参数
```

## 📋 检查清单

添加新页面时的检查清单：

- [ ] 页面组件已创建
- [ ] 已添加到 `routeConfig`
- [ ] 已设置正确的 `keepAlive` 值
- [ ] 已添加到菜单配置（如需要）
- [ ] 已测试页面缓存功能
- [ ] 已处理数据更新逻辑
- [ ] 已清理事件监听器

## 🔗 相关文件

| 文件 | 作用 | 修改频率 |
|------|------|----------|
| `BasicLayout.tsx` | 路由配置和缓存控制 | 🟡 中等 |
| `KeepAlive.tsx` | 缓存实现逻辑 | 🟢 很少 |
| `tabs.ts` | 标签页状态管理 | 🟢 很少 |
| `Tabs.tsx` | 标签页 UI 组件 | 🟢 很少 |

## 💡 最佳实践

1. **合理使用缓存**: 不是所有页面都需要缓存
2. **及时清理**: 确保组件卸载时清理资源
3. **数据同步**: 缓存页面要考虑数据更新策略
4. **性能监控**: 定期检查缓存数量和内存使用
5. **用户体验**: 提供手动刷新选项给用户