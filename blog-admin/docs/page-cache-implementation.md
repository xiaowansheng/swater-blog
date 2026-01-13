# 页面缓存实现状态

## 当前实现方案

### 方案概述
采用自定义路由渲染 + KeepAlive 组件缓存的方式，绕过 React Router 的 `<Outlet />` 组件重新挂载问题。

### 核心文件
- `src/layout/BasicLayout.tsx` - 主布局，包含自定义路由渲染逻辑
- `src/components/common/KeepAlive.tsx` - 组件缓存实现
- `src/pages/TestCache.tsx` - 缓存测试页面

### 实现原理

1. **绕过 React Router Outlet**
   - 在 BasicLayout 中直接根据当前路径匹配组件
   - 不使用 `<Outlet />` 避免组件重新挂载

2. **组件实例缓存**
   - 使用全局 Map 缓存组件实例
   - 为每个缓存组件分配唯一 key 防止重新创建
   - 通过 display 样式控制组件显示/隐藏

3. **缓存管理**
   - 支持最大缓存数量限制（默认10个）
   - LRU 策略清理旧缓存
   - 支持手动清理和刷新

### 测试方法

1. 访问 `/test-cache` 页面
2. 修改计数器和输入框内容
3. 切换到其他页面再回来
4. 检查状态是否保持，控制台是否有重新挂载日志

### 预期效果

如果缓存工作正常：
- ✅ 组件挂载时间不变
- ✅ 状态（计数器、输入框）保持
- ✅ 控制台无重新挂载日志
- ✅ 数据不会重新加载

### 当前状态

🔄 **实现完成，待测试验证**

需要启动开发服务器测试实际效果。

## 使用说明

### 启用/禁用缓存
在 `routeConfig` 中设置 `keepAlive: false` 可禁用特定页面的缓存。

### 手动清理缓存
```javascript
// 清理特定页面缓存
window.dispatchEvent(new CustomEvent('tab-remove', { 
  detail: { key: '/article/edit/123' } 
}))

// 刷新特定页面缓存
window.dispatchEvent(new CustomEvent('tab-refresh', { 
  detail: { key: '/article/edit/123' } 
}))
```

### 调试信息
所有缓存操作都会在控制台输出详细日志，便于调试。