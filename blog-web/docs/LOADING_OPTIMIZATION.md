# 前台页面加载动画优化文档

## 概述

本次优化实现了"加载完成即关闭"的设计理念，同时保留了所有可爱的动画效果。

## 核心改进

### 1. 路由切换加载（useSimpleRouteLoading）

**优化前：**
- 固定等待 1000ms，无论页面是否已加载完成
- 快速切换时可能出现状态混乱

**优化后：**
- ✅ 路由完成 + DOM 渲染完成后立即关闭
- ✅ 保留 250ms 最小时长防止闪烁
- ✅ 并发安全：使用 token 机制防止快速切换时的状态错乱
- ✅ 支持 PageReady 机制：可等待数据加载完成

### 2. 顶部进度条（TopProgressBar）

**优化前：**
- 依赖全局 loading 状态，被 1000ms 最小时长拖慢

**优化后：**
- ✅ 直接监听路由变化，不依赖全局状态
- ✅ 更敏捷的响应，路由完成立即到 100%
- ✅ 模拟进度增长到 90%，给用户更好的反馈

### 3. 首屏加载（PageLoadingWrapper）

**优化前：**
- 固定等待 3000ms，即使页面秒开也要等待

**优化后：**
- ✅ 保留品牌开场动画（3000ms 最大时长）
- ✅ 监听真实加载完成（document.load、requestIdleCallback）
- ✅ 如果加载很快，开场动画会相应缩短（最小 800ms）
- ✅ 使用 sessionStorage 区分首次/后续访问

### 4. PageReady 机制（新增）

**用途：**
- 通知页面关键数据已加载完成
- 防止路由完成但数据还在加载时过早关闭 loading

## 配置参数

所有配置集中在 `src/lib/constants/loading.ts`：

```typescript
export const LOADING_CONFIG = {
  // 路由切换最小时长（防闪烁）
  ROUTE_MIN_DURATION: 250,

  // 首屏加载最小时长
  INITIAL_MIN_DURATION: 800,

  // 首屏品牌动画最大时长
  INITIAL_BRAND_ANIMATION: 3000,

  // 加载显示阈值（可选优化）
  SHOW_THRESHOLD: 100,

  // 进度条配置
  PROGRESS_INTERVAL: 100,
  PROGRESS_MAX_BEFORE_COMPLETE: 90,
};
```

## 使用指南

### 基础使用（无需修改）

大部分页面无需任何修改，自动享受优化效果。

### 高级使用：PageReady 机制

对于有数据加载的页面，可以使用 PageReady 机制：

#### 示例 1：自动标记就绪（静态页面）

```tsx
import { useAutoPageReady } from '@/lib/hooks/usePageReady';

function StaticPage() {
  // 组件挂载后立即标记就绪
  useAutoPageReady();
  
  return <div>静态内容</div>;
}
```

#### 示例 2：数据加载完成后标记

```tsx
import { markPageReady } from '@/lib/hooks/usePageReady';
import { useEffect, useState } from 'react';

function DataPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(result => {
        setData(result);
        setLoading(false);
        // 数据加载完成，标记页面就绪
        markPageReady();
      });
  }, []);

  if (loading) {
    return <Skeleton />;
  }

  return <div>{data}</div>;
}
```

#### 示例 3：多个数据源

```tsx
import { markPageReady } from '@/lib/hooks/usePageReady';
import { useEffect, useState } from 'react';

function ComplexPage() {
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchData1(),
      fetchData2(),
    ]).then(([result1, result2]) => {
      setData1(result1);
      setData2(result2);
      // 所有关键数据加载完成
      markPageReady();
    });
  }, []);

  return <div>...</div>;
}
```

#### 示例 4：使用 Hook 监听就绪

```tsx
import { usePageReady } from '@/lib/hooks/usePageReady';

function MyPage() {
  usePageReady(() => {
    console.log('页面已就绪，可以执行后续操作');
    // 例如：启动动画、加载非关键资源等
  });

  return <div>...</div>;
}
```

## 测试场景

### 1. 快速页面切换
- ✅ loading 不闪烁
- ✅ 不会被强制等待 1 秒
- ✅ 连续快速点击不会出现状态错乱

### 2. 慢速页面加载
- ✅ loading 持续到真实完成
- ✅ 进度条正常显示反馈

### 3. 首次访问
- ✅ 显示完整的品牌开场动画
- ✅ 如果加载很快，动画会相应缩短

### 4. 后续访问
- ✅ 不显示首屏动画
- ✅ 只显示路由切换动画

### 5. 路由错误/中断
- ✅ loading 能正常关闭

## 性能指标

- **路由切换最小时长**：250ms（优化前：1000ms）
- **首屏加载最小时长**：800ms（优化前：3000ms）
- **首屏最大等待**：3000ms（保留品牌动画）
- **并发安全**：✅ 支持
- **闪烁防护**：✅ 支持

## 注意事项

1. **不要过度使用 PageReady**：只在真正需要等待数据的页面使用
2. **标记时机**：在关键数据加载完成、骨架屏消失时标记
3. **兼容性**：所有现代浏览器支持，包括移动端
4. **调试**：可以在浏览器控制台查看 loading 状态变化

## 调优建议

如果觉得动画太快/太慢，可以调整 `loading.ts` 中的配置：

```typescript
// 更快的体验（适合性能好的设备）
ROUTE_MIN_DURATION: 200,
INITIAL_MIN_DURATION: 600,

// 更稳定的体验（适合性能一般的设备）
ROUTE_MIN_DURATION: 300,
INITIAL_MIN_DURATION: 1000,
```

## 技术细节

### 并发安全机制

使用递增的 token 标识每次加载：

```typescript
let currentToken = 0;

const startLoading = () => {
  currentToken++;
  return currentToken;
};

const stopLoading = (token) => {
  // 只处理当前 token 的请求
  if (token !== currentToken) return;
  // ...
};
```

### 最小时长防闪烁

```typescript
const elapsed = Date.now() - startAt;
const remaining = Math.max(0, minDuration - elapsed);

setTimeout(() => {
  // 关闭 loading
}, remaining);
```

### 首屏加载优化

监听多个信号，取最快的：
1. `document.readyState === 'complete'`
2. `window.load` 事件
3. `requestIdleCallback`（如果支持）
4. 最大等待时间（品牌动画时长）

## 总结

本次优化在保留所有可爱动画效果的前提下，实现了：
- ✅ 加载完成即关闭
- ✅ 最小时长防闪烁
- ✅ 并发安全
- ✅ 首屏品牌动画保留
- ✅ 可选的 PageReady 机制

用户体验显著提升，页面切换更加流畅自然！
