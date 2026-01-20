import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

interface RouteCacheProps {
  children: React.ReactNode
}

interface CachedRoute {
  path: string
  component: React.ReactElement
  isActive: boolean
  lastActiveTime: number
}

// 全局路由缓存
const routeCache = new Map<string, CachedRoute>()
const MAX_CACHE = 10

export const RouteCache: React.FC<RouteCacheProps> = ({ children }) => {
  const location = useLocation()
  const [renderKey, setRenderKey] = useState(0)
  const currentPathRef = useRef(location.pathname)

  console.log('🚀 RouteCache Render:', {
    currentPath: location.pathname,
    cacheSize: routeCache.size,
    allCachedPaths: Array.from(routeCache.keys()),
    renderKey
  })

  // 强制重新渲染
  const forceUpdate = () => setRenderKey(prev => prev + 1)

  // 路由缓存管理
  useEffect(() => {
    const currentPath = location.pathname
    console.log('🔄 RouteCache 路由变化:', { 
      from: currentPathRef.current, 
      to: currentPath 
    })

    // 更新所有缓存项的活跃状态
    routeCache.forEach((cached, path) => {
      cached.isActive = path === currentPath
    })

    // 如果当前路由还没有缓存
    if (!routeCache.has(currentPath)) {
      console.log('💾 缓存新路由:', currentPath)
      
      // 清理超出限制的缓存
      if (routeCache.size >= MAX_CACHE) {
        const sortedEntries = Array.from(routeCache.entries())
          .sort(([, a], [, b]) => a.lastActiveTime - b.lastActiveTime)
        
        const pathsToDelete = sortedEntries.slice(0, routeCache.size - MAX_CACHE + 1)
        pathsToDelete.forEach(([path]) => {
          console.log('🗑️ 清理旧路由缓存:', path)
          routeCache.delete(path)
        })
      }

      // 缓存当前路由组件
      routeCache.set(currentPath, {
        path: currentPath,
        component: children as React.ReactElement,
        isActive: true,
        lastActiveTime: Date.now()
      })
    } else {
      console.log('📦 使用现有路由缓存:', currentPath)
      // 更新最后活跃时间
      const cached = routeCache.get(currentPath)!
      cached.lastActiveTime = Date.now()
      cached.isActive = true
    }

    currentPathRef.current = currentPath
    forceUpdate()
  }, [location.pathname, children])

  // 监听标签页清理事件
  useEffect(() => {
    const handleRemove = (event: CustomEvent) => {
      const pathToRemove = event.detail.key
      console.log('🗑️ 手动移除路由缓存:', pathToRemove)
      routeCache.delete(pathToRemove)
      forceUpdate()
    }

    const handleRefresh = (event: CustomEvent) => {
      const pathToRefresh = event.detail.key
      console.log('🔄 手动刷新路由缓存:', pathToRefresh)
      routeCache.delete(pathToRefresh)
      forceUpdate()
    }

    window.addEventListener('tab-remove', handleRemove as EventListener)
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    
    return () => {
      window.removeEventListener('tab-remove', handleRemove as EventListener)
      window.removeEventListener('tab-refresh', handleRefresh as EventListener)
    }
  }, [])

  // 渲染所有缓存的路由组件
  const renderCachedRoutes = useMemo(() => {
    console.log('🎨 重新计算路由渲染列表')
    
    return Array.from(routeCache.entries()).map(([path, cached]) => {
      console.log(`🎨 渲染路由 ${path}: ${cached.isActive ? '显示' : '隐藏'}`)
      
      return (
        <div
          key={path}
          style={{
            display: cached.isActive ? 'block' : 'none',
            height: '100%',
            width: '100%'
          }}
        >
          {cached.component}
        </div>
      )
    })
  }, [renderKey])

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {renderCachedRoutes}
    </div>
  )
}