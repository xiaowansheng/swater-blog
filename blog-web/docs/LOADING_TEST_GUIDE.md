# 加载动画优化测试指南

## 快速测试步骤

### 1. 测试路由切换加载

#### 测试 A：快速页面切换
1. 打开浏览器开发者工具 → Network 标签
2. 设置网络速度为 "Fast 3G" 或 "Slow 3G"
3. 在网站内快速点击不同页面链接
4. **预期结果**：
   - ✅ loading 动画出现但不闪烁
   - ✅ 页面加载完成后立即关闭（不会强制等待 1 秒）
   - ✅ 顶部进度条流畅到达 100%

#### 测试 B：极快切换（本地环境）
1. 恢复正常网络速度
2. 快速连续点击多个页面链接
3. **预期结果**：
   - ✅ loading 最多出现一下（250ms），不拖延
   - ✅ 不会出现闪烁
   - ✅ 连续点击不会出现状态错乱

#### 测试 C：并发安全测试
1. 点击页面 A 的链接
2. 在 loading 显示时，立即点击页面 B 的链接
3. 再点击页面 C 的链接
4. **预期结果**：
   - ✅ loading 状态正常
   - ✅ 最终停在页面 C
   - ✅ loading 正常关闭，不会一直显示

### 2. 测试首屏加载

#### 测试 A：首次访问
1. 清除浏览器缓存和 sessionStorage
2. 访问网站首页
3. **预期结果**：
   - ✅ 显示完整的品牌开场动画
   - ✅ 动画流畅，有进度条和场景切换
   - ✅ 如果加载很快，动画会在 800ms-3000ms 之间结束
   - ✅ 如果加载慢，动画会等待真实完成

#### 测试 B：后续访问
1. 首次访问后，点击其他页面再返回首页
2. 或者刷新页面
3. **预期结果**：
   - ✅ 不显示首屏开场动画
   - ✅ 只显示路由切换动画（如果有）
   - ✅ 页面加载更快

#### 测试 C：清除 sessionStorage
1. 打开浏览器控制台
2. 执行：`sessionStorage.clear()`
3. 刷新页面
4. **预期结果**：
   - ✅ 再次显示首屏开场动画

### 3. 测试顶部进度条

#### 测试 A：进度条响应速度
1. 点击任意页面链接
2. 观察顶部进度条
3. **预期结果**：
   - ✅ 立即出现（不延迟）
   - ✅ 流畅增长到 90% 左右
   - ✅ 页面加载完成后快速到 100%
   - ✅ 300ms 后消失

#### 测试 B：进度条与 loading 的协调
1. 点击页面链接
2. 同时观察顶部进度条和全屏 loading 动画
3. **预期结果**：
   - ✅ 两者同时出现
   - ✅ 进度条可能先到 100%（更敏捷）
   - ✅ loading 动画会等待最小时长（250ms）
   - ✅ 两者都能正常关闭

### 4. 测试 PageReady 机制（可选）

如果你的某些页面使用了 PageReady 机制：

#### 测试 A：数据加载页面
1. 访问有数据加载的页面（如文章详情）
2. 观察 loading 动画
3. **预期结果**：
   - ✅ loading 持续到数据加载完成
   - ✅ 骨架屏消失后 loading 关闭
   - ✅ 不会过早关闭

#### 测试 B：静态页面
1. 访问静态页面（如关于页面）
2. **预期结果**：
   - ✅ loading 快速关闭（250ms 左右）
   - ✅ 不会等待不必要的时间

## 性能对比测试

### 优化前 vs 优化后

使用浏览器开发者工具的 Performance 标签记录：

| 场景 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| 快速页面切换 | 强制 1000ms | 250-300ms | ⬇️ 70% |
| 首屏加载（快速） | 固定 3000ms | 800-1500ms | ⬇️ 50-73% |
| 首屏加载（慢速） | 3000ms | 真实时长 | ✅ 不假等 |
| 路由错误恢复 | 可能卡住 | 正常关闭 | ✅ 更可靠 |

## 调试工具

### 1. 添加调试面板

在 `blog-web/src/app/[locale]/layout.tsx` 中临时添加：

```tsx
// 仅开发环境
{process.env.NODE_ENV === 'development' && <LoadingDebugPanel />}
```

创建 `LoadingDebugPanel.tsx`：

```tsx
'use client';

import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';
import { getPageReadyState } from '@/lib/hooks/usePageReady';
import { useState, useEffect } from 'react';

export default function LoadingDebugPanel() {
  const { isLoading } = useSimpleRouteLoading();
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPageReady(getPageReadyState());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-[10000]">
      <div>Route Loading: {isLoading ? '🔄' : '✅'}</div>
      <div>Page Ready: {pageReady ? '✅' : '⏳'}</div>
    </div>
  );
}
```

### 2. 控制台日志

在浏览器控制台执行：

```javascript
// 查看 sessionStorage
console.log('Has Visited:', sessionStorage.getItem('hasVisited'));

// 清除首次访问标记
sessionStorage.removeItem('hasVisited');

// 模拟慢速加载
// 在 Network 标签中设置 "Slow 3G"
```

### 3. 性能测量

```javascript
// 在控制台执行
performance.mark('route-start');
// 点击链接...
performance.mark('route-end');
performance.measure('route-change', 'route-start', 'route-end');
console.log(performance.getEntriesByName('route-change'));
```

## 常见问题排查

### 问题 1：loading 一直不关闭

**可能原因**：
- 页面使用了 PageReady 但忘记调用 `markPageReady()`
- 数据请求出错但没有在 catch 中标记就绪

**解决方法**：
```tsx
// 确保错误时也标记就绪
fetchData()
  .then(() => markPageReady())
  .catch(() => markPageReady()); // 重要！
```

### 问题 2：loading 闪烁

**可能原因**：
- 最小时长设置太短
- 网络波动导致

**解决方法**：
```typescript
// 在 loading.ts 中调整
ROUTE_MIN_DURATION: 300, // 增加到 300ms
```

### 问题 3：首屏动画太长/太短

**解决方法**：
```typescript
// 在 loading.ts 中调整
INITIAL_MIN_DURATION: 1000, // 最小时长
INITIAL_BRAND_ANIMATION: 2500, // 最大时长
```

### 问题 4：快速切换时状态错乱

**检查**：
- 确保使用的是最新的 `useSimpleRouteLoading`
- 检查是否有其他地方直接操作 loading 状态

## 浏览器兼容性测试

在以下浏览器中测试：

- ✅ Chrome/Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ 移动端 Safari (iOS)
- ✅ 移动端 Chrome (Android)

## 移动端测试

1. 使用 Chrome DevTools 的设备模拟器
2. 或在真实移动设备上测试
3. **注意事项**：
   - 移动端网络可能更慢
   - 触摸事件与点击事件的差异
   - 屏幕尺寸对动画的影响

## 压力测试

### 测试 A：快速连续点击
1. 使用自动化工具或手动快速点击
2. 连续点击 10-20 次不同的链接
3. **预期结果**：
   - ✅ 不会崩溃
   - ✅ loading 状态正常
   - ✅ 最终停在正确的页面

### 测试 B：长时间使用
1. 在网站上浏览 10-15 分钟
2. 访问各种不同的页面
3. **预期结果**：
   - ✅ 性能不下降
   - ✅ 内存不泄漏
   - ✅ loading 始终正常工作

## 测试清单

- [ ] 快速页面切换（本地）
- [ ] 慢速页面切换（限速）
- [ ] 并发安全（快速连续点击）
- [ ] 首次访问（清除缓存）
- [ ] 后续访问（有缓存）
- [ ] 顶部进度条响应
- [ ] 路由错误处理
- [ ] 移动端测试
- [ ] 多浏览器测试
- [ ] 压力测试

## 验收标准

✅ **通过标准**：
- 快速切换不闪烁
- 慢速加载有反馈
- 首屏动画流畅
- 后续访问快速
- 无状态错乱
- 无内存泄漏

❌ **需要调整**：
- loading 经常闪烁 → 增加最小时长
- loading 太慢 → 减少最小时长
- 首屏太长 → 减少品牌动画时长
- 首屏太短 → 增加最小时长

## 反馈与调优

测试完成后，根据实际体验调整 `loading.ts` 中的配置：

```typescript
// 示例：针对不同场景的推荐配置

// 配置 1：追求极致速度（适合高性能设备）
ROUTE_MIN_DURATION: 200,
INITIAL_MIN_DURATION: 600,
INITIAL_BRAND_ANIMATION: 2000,

// 配置 2：平衡体验（推荐）
ROUTE_MIN_DURATION: 250,
INITIAL_MIN_DURATION: 800,
INITIAL_BRAND_ANIMATION: 3000,

// 配置 3：稳定优先（适合低性能设备）
ROUTE_MIN_DURATION: 300,
INITIAL_MIN_DURATION: 1000,
INITIAL_BRAND_ANIMATION: 3500,
```

祝测试顺利！🎉
