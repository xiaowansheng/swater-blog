import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useLocation, matchPath } from 'react-router-dom'

interface KeepAliveProps {
  children: React.ReactNode
  include?: string[]
  exclude?: string[]
  maxCache?: number
}

interface CachedComponent {
  path: string
  element: React.ReactElement
  isActive: boolean
  lastActiveTime: number
}

// 全局缓存
const componentCache = new Map<string, CachedComponent>()
const MAX_CACHE = 10

export const KeepAliveV2: React.FC<KeepAliveProps> = ({ 
  children, 
  include = [],
  exclude = [],
  maxCache = MAX_CACHE
}) => {
  const location = useLocation()
  const [renderKey, setRenderKey] = useState(0)
  const currentPathRef = useRef(location.pathname)

  console.log('🎯 KeepAliveV2 Render:', {
    currentPath: location.pathname,
    cacheSize: componentCache.size,
    allCachedPaths: Array.from(componentCache.keys()),
    renderKey
  })

  // 检查路径是否应该被缓存
  const shouldCache = useMemo(() => {
    const currentPath = location.pathname
    
    // 如果有排除列表，检查是否在排除列表中
    if (exclude.length > 0) {
      const isExcluded = exclude.some(pattern => 
        matchPath({ path: pattern, exact: false }, currentPath)
      )
      if (isExcluded) return false
    }
    
    // 如果有包含列表，检查是否在包含列表中
    if (include.length > 0) {
      return include.some(pattern => 
        matchPath({ path: pattern, exact: false }, currentPath)
      )
    }
    
    // 默认缓存所有路径
    return true
  }, [location.pathname, include, exclude])

  // 强制重新渲染
  const forceUpdate = () => setRenderKey(prev => prev + 1)

  // 缓存管理
  useEffect(() => {
    const currentPath = location.pathname
    console.log('🔄 KeepAliveV2 路径变化:', { 
      from: currentPathRef.current, 
      to: currentPath,
      shouldCache
    })

    if (!shouldCache) {
      console.log('🚫 当前路径不需要缓存:', currentPath)
      // 更新所有缓存项为非活跃状态
      componentCache.forEach((cached) => {
        cached.isActive = false
      })
      forceUpdate()
      return
    }

    // 更新所有缓存项的活跃状态
    componentCache.forEach((cached, path) => {
      cached.isActive = path === currentPath
    })

    // 如果当前路径还没有缓存
    if (!componentCache.has(currentPath)) {
      console.log('💾 缓存新路径:', currentPath)
      
      // 清理超出限制的缓存
      if (componentCache.size >= maxCache) {
        const sortedEntries = Array.from(componentCache.entries())
          .sort(([, a], [, b]) => a.lastActiveTime - b.lastActiveTime)
        
        const pathsToDelete = sortedEntries.slice(0, componentCache.size - maxCache + 1)
        pathsToDelete.forEach(([path]) => {
          console.log('🗑️ 清理旧缓存:', path)
          componentCache.delete(path)
        })
      }

      // 缓存当前路径组件
      componentCache.set(currentPath, {
        path: currentPath,
        element: React.cloneElement(children as React.ReactElement, { key: currentPath }),
        isActive: true,
        lastActiveTime: Date.now()
      })
    } else {
      console.log('📦 使用现有缓存:', currentPath)
      // 更新最后活跃时间
      const cached = componentCache.get(currentPath)!
      cached.lastActiveTime = Date.now()
      cached.isActive = true
    }

    currentPathRef.current = currentPath
    forceUpdate()
  }, [location.pathname, shouldCache, children, maxCache])

  // 监听标签页清理事件
  useEffect(() => {
    const handleRemove = (event: CustomEvent) => {
      const pathToRemove = event.detail.key
      console.log('🗑️ 手动移除缓存:', pathToRemove)
      componentCache.delete(pathToRemove)
      forceUpdate()
    }

    const handleRefresh = (event: CustomEvent) => {
      const pathToRefresh = event.detail.key
      console.log('🔄 手动刷新缓存:', pathToRefresh)
      componentCache.delete(pathToRefresh)
      forceUpdate()
    }

    window.addEventListener('tab-remove', handleRemove as EventListener)
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    
    return () => {
      window.removeEventListener('tab-remove', handleRemove as EventListener)
      window.removeEventListener('tab-refresh', handleRefresh as EventListener)
    }
  }, [])

  // 渲染缓存的组件
  const renderContent = useMemo(() => {
    console.log('🎨 重新计算渲染内容')
    
    if (!shouldCache) {
      console.log('🚫 不缓存，直接渲染')
      return (
        <div style={{ height: '100%', width: '100%' }}>
          {children}
        </div>
      )
    }

    // 渲染所有缓存的组件
    const cachedElements = Array.from(componentCache.entries()).map(([path, cached]) => {
      console.log(`🎨 渲染组件 ${path}: ${cached.isActive ? '显示' : '隐藏'}`)
      
      return (
        <div
          key={path}
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

    // 如果当前路径没有缓存，添加新的渲染
    const currentPath = location.pathname
    if (!componentCache.has(currentPath)) {
      console.log('🆕 添加新组件渲染:', currentPath)
      cachedElements.push(
        <div
          key={`new-${currentPath}`}
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
  }, [shouldCache, children, location.pathname, renderKey])

  return renderContent
}