import React, { useEffect, useState } from 'react'

interface KeepAliveProps {
  children: React.ReactNode
  cacheKey: string
  maxCache?: number
  shouldCache?: boolean
}

// 全局缓存 Map
const cacheComponents = new Map<string, React.ReactNode>()
const activeCacheKeys = new Set<string>()
const MAX_CACHE = 10

export const KeepAlive: React.FC<KeepAliveProps> = ({ 
  children, 
  cacheKey, 
  maxCache = MAX_CACHE,
  shouldCache = true 
}) => {
  const [, forceUpdate] = useState({})

  console.log('🎯 KeepAlive Render:', {
    cacheKey,
    shouldCache,
    hasCached: cacheComponents.has(cacheKey),
    cacheSize: cacheComponents.size,
    activeCacheKeys: Array.from(activeCacheKeys),
    allCacheKeys: Array.from(cacheComponents.keys())
  })

  // 如果不需要缓存，直接渲染
  if (!shouldCache) {
    return <div style={{ height: '100%' }}>{children}</div>
  }

  // 添加到活跃缓存
  activeCacheKeys.add(cacheKey)

  useEffect(() => {
    // 缓存当前组件
    if (!cacheComponents.has(cacheKey)) {
      // 清理超出限制的缓存
      if (cacheComponents.size >= maxCache) {
        const keysToDelete = Array.from(cacheComponents.keys()).slice(0, cacheComponents.size - maxCache + 1)
        keysToDelete.forEach(key => {
          cacheComponents.delete(key)
          activeCacheKeys.delete(key)
        })
      }
      cacheComponents.set(cacheKey, children)
    } else {
      // 更新缓存的组件
      cacheComponents.set(cacheKey, children)
    }
  }, [children, cacheKey, maxCache])

  // 监听标签页移除事件
  useEffect(() => {
    const handleRemove = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
        cacheComponents.delete(cacheKey)
        activeCacheKeys.delete(cacheKey)
      }
    }

    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
        cacheComponents.delete(cacheKey)
        activeCacheKeys.delete(cacheKey)
        forceUpdate({})
      }
    }

    window.addEventListener('tab-remove', handleRemove as EventListener)
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    
    return () => {
      window.removeEventListener('tab-remove', handleRemove as EventListener)
      window.removeEventListener('tab-refresh', handleRefresh as EventListener)
    }
  }, [cacheKey])

  // 清理非活跃的缓存键
  useEffect(() => {
    return () => {
      activeCacheKeys.delete(cacheKey)
    }
  }, [cacheKey])

  return (
    <div style={{ height: '100%' }}>
      {/* 渲染所有缓存的组件，但只显示当前的 */}
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
      
      {/* 如果当前组件还没有缓存，直接渲染 */}
      {!cacheComponents.has(cacheKey) && (
        <div style={{ height: '100%' }}>
          {children}
        </div>
      )}
    </div>
  )
}

