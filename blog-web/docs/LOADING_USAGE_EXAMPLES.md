# 加载动画使用示例

## 场景 1：文章详情页（有数据加载）

```tsx
'use client';

import { useEffect, useState } from 'react';
import { markPageReady } from '@/lib/hooks/usePageReady';
import { getArticleDetail } from '@/lib/api/article';

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticleDetail(params.id)
      .then(data => {
        setArticle(data);
        setLoading(false);
        
        // 关键：数据加载完成后标记页面就绪
        markPageReady();
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
        
        // 即使出错也要标记就绪，避免 loading 一直显示
        markPageReady();
      });
  }, [params.id]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  return (
    <article>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}
```

## 场景 2：列表页（分页加载）

```tsx
'use client';

import { useEffect, useState } from 'react';
import { markPageReady } from '@/lib/hooks/usePageReady';
import { getArticleList } from '@/lib/api/article';

export default function ArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // 首次加载
  useEffect(() => {
    getArticleList({ page: 1 })
      .then(data => {
        setArticles(data.list);
        setLoading(false);
        
        // 首次数据加载完成，标记页面就绪
        markPageReady();
      });
  }, []);

  // 加载更多（不需要再次标记 ready）
  const loadMore = () => {
    getArticleList({ page: page + 1 })
      .then(data => {
        setArticles([...articles, ...data.list]);
        setPage(page + 1);
      });
  };

  if (loading) {
    return <ListSkeleton />;
  }

  return (
    <div>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
      <button onClick={loadMore}>加载更多</button>
    </div>
  );
}
```

## 场景 3：静态页面（无数据加载）

```tsx
'use client';

import { useAutoPageReady } from '@/lib/hooks/usePageReady';

export default function AboutPage() {
  // 静态页面，组件挂载后立即标记就绪
  useAutoPageReady();

  return (
    <div>
      <h1>关于我们</h1>
      <p>这是一个静态页面...</p>
    </div>
  );
}
```

## 场景 4：多数据源页面

```tsx
'use client';

import { useEffect, useState } from 'react';
import { markPageReady } from '@/lib/hooks/usePageReady';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 并行加载多个数据源
    Promise.all([
      fetchStats(),
      fetchRecentPosts(),
      fetchRecentComments(),
    ])
      .then(([statsData, postsData, commentsData]) => {
        setStats(statsData);
        setRecentPosts(postsData);
        setComments(commentsData);
        setLoading(false);
        
        // 所有关键数据加载完成
        markPageReady();
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
        markPageReady();
      });
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <StatsPanel stats={stats} />
      <RecentPosts posts={recentPosts} />
      <RecentComments comments={comments} />
    </div>
  );
}
```

## 场景 5：使用 React Query / SWR

```tsx
'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { markPageReady } from '@/lib/hooks/usePageReady';

export default function ArticlePage({ params }: { params: { id: string } }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['article', params.id],
    queryFn: () => getArticleDetail(params.id),
  });

  // 监听加载状态变化
  useEffect(() => {
    if (!isLoading) {
      // 数据加载完成（成功或失败）
      markPageReady();
    }
  }, [isLoading]);

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (isError) {
    return <ErrorMessage />;
  }

  return <ArticleContent article={data} />;
}
```

## 场景 6：服务端渲染页面（SSR）

```tsx
// 服务端组件，数据已在服务端加载
import { getArticleDetail } from '@/lib/api/article.server';
import ClientWrapper from './ClientWrapper';

export default async function ArticlePage({ params }: { params: { id: string } }) {
  // 服务端获取数据
  const article = await getArticleDetail(params.id);

  // 传递给客户端组件
  return <ClientWrapper article={article} />;
}

// ClientWrapper.tsx
'use client';

import { useAutoPageReady } from '@/lib/hooks/usePageReady';

export default function ClientWrapper({ article }) {
  // SSR 页面，数据已就绪，立即标记
  useAutoPageReady();

  return (
    <article>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}
```

## 场景 7：图片懒加载页面

```tsx
'use client';

import { useState, useEffect } from 'react';
import { markPageReady } from '@/lib/hooks/usePageReady';
import Image from 'next/image';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    fetchImages().then(data => {
      setImages(data);
    });
  }, []);

  useEffect(() => {
    // 当所有关键图片加载完成时标记就绪
    if (images.length > 0 && loadedCount >= Math.min(3, images.length)) {
      markPageReady();
    }
  }, [loadedCount, images.length]);

  const handleImageLoad = () => {
    setLoadedCount(prev => prev + 1);
  };

  return (
    <div className="gallery">
      {images.map((img, index) => (
        <Image
          key={img.id}
          src={img.url}
          alt={img.title}
          onLoad={handleImageLoad}
          priority={index < 3} // 前3张优先加载
        />
      ))}
    </div>
  );
}
```

## 场景 8：不需要等待数据的页面

```tsx
'use client';

// 不导入任何 PageReady 相关的 hook
// 页面会在路由完成 + DOM 渲染后自动关闭 loading

export default function SimplePage() {
  // 无需任何特殊处理
  return (
    <div>
      <h1>简单页面</h1>
      <p>这个页面不需要等待数据加载</p>
    </div>
  );
}
```

## 最佳实践

### ✅ 推荐做法

1. **只在关键数据加载完成后标记**
   ```tsx
   // ✅ 好：等待关键数据
   fetchCriticalData().then(() => markPageReady());
   
   // ❌ 差：等待所有数据（包括非关键的）
   Promise.all([critical, nonCritical]).then(() => markPageReady());
   ```

2. **出错时也要标记就绪**
   ```tsx
   // ✅ 好：确保 loading 能关闭
   fetchData()
     .then(() => markPageReady())
     .catch(() => markPageReady());
   ```

3. **静态页面使用 useAutoPageReady**
   ```tsx
   // ✅ 好：简洁明了
   useAutoPageReady();
   
   // ❌ 差：多余的代码
   useEffect(() => {
     markPageReady();
   }, []);
   ```

### ❌ 避免的做法

1. **不要过早标记**
   ```tsx
   // ❌ 差：数据还没加载就标记
   useEffect(() => {
     markPageReady(); // 太早了！
     fetchData().then(setData);
   }, []);
   ```

2. **不要重复标记**
   ```tsx
   // ❌ 差：每次渲染都标记
   markPageReady(); // 应该在 useEffect 中
   ```

3. **不要忘记错误处理**
   ```tsx
   // ❌ 差：出错时 loading 永远不关闭
   fetchData().then(() => markPageReady());
   // 应该加 .catch(() => markPageReady())
   ```

## 调试技巧

### 1. 查看 loading 状态

```tsx
import { useSimpleRouteLoading } from '@/lib/hooks/useSimpleRouteLoading';

function DebugPanel() {
  const { isLoading } = useSimpleRouteLoading();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded">
      Loading: {isLoading ? '✅' : '❌'}
    </div>
  );
}
```

### 2. 查看 PageReady 状态

```tsx
import { getPageReadyState } from '@/lib/hooks/usePageReady';

useEffect(() => {
  console.log('Page Ready:', getPageReadyState());
}, []);
```

### 3. 测量加载时间

```tsx
useEffect(() => {
  const start = Date.now();
  
  fetchData().then(() => {
    const elapsed = Date.now() - start;
    console.log(`Data loaded in ${elapsed}ms`);
    markPageReady();
  });
}, []);
```

## 总结

- **大部分页面**：无需任何修改，自动优化
- **有数据加载的页面**：使用 `markPageReady()`
- **静态页面**：使用 `useAutoPageReady()`
- **记得错误处理**：确保 loading 能正常关闭
