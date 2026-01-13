import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

interface KeepAliveProps {
  children: React.ReactNode
  cacheKey: string
  shouldCache?: boolean
  maxCache?: number
}

interface CachedComponent {
  key: string
  element: React.ReactElement
  isActive: boolean
  lastActiveTime: number
}

// 全局缓存存储
const componentCache = new Map<string, CachedComponent>()
const MAX_CACHE = 10

export const KeepAlive: React.FC<KeepAliveProps> = ({ 
  children, 
  cacheKey, 
  shouldCache = true,
  maxCache = MAX_CACHE
}) => {
  const location = useLocation()
  const [renderKey, setRenderKey] = useState(0)
  const isInitialized = useRef(false)

  console.log('🎯 KeepAlive Render:', {
    cacheKey,
    shouldCache,
    cacheSize: componentCache.size,
    allCacheKeys: Array.from(componentCache.keys()),
    currentLocation: location.pathname,
    renderKey
  })

  // 强制重新渲染
  const forceUpdate = () => setRenderKey(prev => prev + 1)

  // 如果不需要缓存，直接渲染
  if (!shouldCache) {
    console.log('🚫 不缓存，直接渲染:', cacheKey)
    return <div style={{ height: '100%' }}>{children}</div>
  }

  // 缓存管理
  useEffect(() => {
    console.log('🔄 KeepAlive 缓存管理:', { cacheKey, isInitialized: isInitialized.current })

    // 更新所有缓存项的活跃状态
    componentCache.forEach((cached, key) => {
      cached.isActive = key === cacheKey
    })

    // 如果还没有缓存这个组件
    if (!componentCache.has(cacheKey)) {
      console.log('💾 缓存新组件:', cacheKey)
      
      // 清理超出限制的缓存
      if (componentCache.size >= maxCache) {
        const sortedEntries = Array.from(componentCache.entries())
          .sort(([, a], [, b]) => a.lastActiveTime - b.lastActiveTime)
        
        const keysToDelete = sortedEntries.slice(0, componentCache.size - maxCache + 1)
        keysToDelete.forEach(([key]) => {
          console.log('🗑️ 清理旧缓存:', key)
          componentCache.delete(key)
        })
      }

      // 缓存当前组件 - 使用唯一的key确保组件实例不会被重新创建
      const uniqueKey = `${cacheKey}-${Date.now()}`
      componentCache.set(cacheKey, {
        key: uniqueKey,
        element: React.cloneElement(children as React.ReactElement, { key: uniqueKey }),
        isActive: true,
        lastActiveTime: Date.now()
      })
    } else {
      console.log('📦 使用现有缓存:', cacheKey)
      // 更新最后活跃时间
      const cached = componentCache.get(cacheKey)!
      cached.lastActiveTime = Date.now()
      cached.isActive = true
    }

    isInitialized.current = true
    forceUpdate()
  }, [cacheKey, maxCache])

  // 监听清理事件
  useEffect(() => {
    const handleRemove = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
        console.log('🗑️ 手动移除缓存:', cacheKey)
        componentCache.delete(cacheKey)
        forceUpdate()
      }
    }

    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
        console.log('🔄 手动刷新缓存:', cacheKey)
        componentCache.delete(cacheKey)
        forceUpdate()
      }
    }

    window.addEventListener('tab-remove', handleRemove as EventListener)
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    
    return () => {
      window.removeEventListener('tab-remove', handleRemove as EventListener)
      window.removeEventListener('tab-refresh', handleRefresh as EventListener)
    }
  }, [cacheKey])

  // 渲染缓存的组件
  const renderContent = useMemo(() => {
    console.log('🎨 重新计算渲染内容')
    
    // 渲染所有缓存的组件
    const cachedElements = Array.from(componentCache.entries()).map(([key, cached]) => {
      console.log(`🎨 渲染组件 ${key}: ${cached.isActive ? '显示' : '隐藏'}`)
      
      return (
        <div
          key={cached.key}
          style={{
            display: cached.isActive ? 'block' : 'none',
            height: '100%',
            width: '100%'
          }}
        >
          {cached.element}
        </div>
      )
    })

    // 如果当前组件还没有缓存，直接渲染
    if (!componentCache.has(cacheKey)) {
      console.log('🆕 首次渲染组件:', cacheKey)
      cachedElements.push(
        <div
          key={`temp-${cacheKey}`}
          style={{ height: '100%', width: '100%' }}
        >
          {children}
        </div>
      )
    }

    return (
      <div style={{ height: '100%', width: '100%' }}>
        {cachedElements}
      </div>
    )
  }, [cacheKey, children, renderKey])

  return renderContent
}

