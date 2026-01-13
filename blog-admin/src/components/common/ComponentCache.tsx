import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { createRoot, Root } from 'react-dom/client'

interface ComponentCacheProps {
  children: React.ReactNode
}

interface CachedComponent {
  path: string
  container: HTMLDivElement
  root: Root
  isActive: boolean
  lastActiveTime: number
  mounted: boolean
}

// 全局组件缓存
const componentCache = new Map<string, CachedComponent>()
const MAX_CACHE = 10

export const ComponentCache: React.FC<ComponentCacheProps> = ({ children }) => {
  const location = useLocation()
  const [renderKey, setRenderKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentPathRef = useRef(location.pathname)

  console.log('🚀 ComponentCache Render:', {
    currentPath: location.pathname,
    cacheSize: componentCache.size,
    allCachedPaths: Array.from(componentCache.keys()),
    renderKey
  })

  // 强制重新渲染
  const forceUpdate = useCallback(() => {
    setRenderKey(prev => prev + 1)
  }, [])

  // 组件缓存管理
  useEffect(() => {
    const currentPath = location.pathname
    console.log('🔄 ComponentCache 路径变化:', { 
      from: currentPathRef.current, 
      to: currentPath 
    })

    // 更新所有缓存项的活跃状态
    componentCache.forEach((cached, path) => {
      cached.isActive = path === currentPath
      // 隐藏非活跃的容器
      if (cached.container) {
        cached.container.style.display = cached.isActive ? 'block' : 'none'
      }
    })

    // 如果当前路径还没有缓存
    if (!componentCache.has(currentPath)) {
      console.log('💾 缓存新组件:', currentPath)
      
      // 清理超出限制的缓存
      if (componentCache.size >= MAX_CACHE) {
        const sortedEntries = Array.from(componentCache.entries())
          .sort(([, a], [, b]) => a.lastActiveTime - b.lastActiveTime)
        
        const pathsToDelete = sortedEntries.slice(0, componentCache.size - MAX_CACHE + 1)
        pathsToDelete.forEach(([path, cached]) => {
          console.log('🗑️ 清理旧组件缓存:', path)
          if (cached.root) {
            cached.root.unmount()
          }
          if (cached.container && cached.container.parentNode) {
            cached.container.parentNode.removeChild(cached.container)
          }
          componentCache.delete(path)
        })
      }

      // 创建新的容器和 React Root
      const container = document.createElement('div')
      container.style.height = '100%'
      container.style.width = '100%'
      container.style.display = 'block'
      
      const root = createRoot(container)
      
      componentCache.set(currentPath, {
        path: currentPath,
        container,
        root,
        isActive: true,
        lastActiveTime: Date.now(),
        mounted: false
      })
    } else {
      console.log('📦 使用现有组件缓存:', currentPath)
      // 更新最后活跃时间
      const cached = componentCache.get(currentPath)!
      cached.lastActiveTime = Date.now()
      cached.isActive = true
      if (cached.container) {
        cached.container.style.display = 'block'
      }
    }

    currentPathRef.current = currentPath
    forceUpdate()
  }, [location.pathname, forceUpdate])

  // 渲染当前组件到缓存容器
  useEffect(() => {
    const currentPath = location.pathname
    const cached = componentCache.get(currentPath)
    
    if (cached && !cached.mounted) {
      console.log('🎨 首次渲染组件到缓存容器:', currentPath)
      cached.root.render(children)
      cached.mounted = true
      
      // 将容器添加到当前容器中
      if (containerRef.current && !containerRef.current.contains(cached.container)) {
        containerRef.current.appendChild(cached.container)
      }
    } else if (cached && cached.mounted) {
      console.log('🔄 更新缓存组件:', currentPath)
      cached.root.render(children)
      
      // 确保容器在当前容器中
      if (containerRef.current && !containerRef.current.contains(cached.container)) {
        containerRef.current.appendChild(cached.container)
      }
    }
  }, [children, location.pathname])

  // 监听标签页清理事件
  useEffect(() => {
    const handleRemove = (event: CustomEvent) => {
      const pathToRemove = event.detail.key
      console.log('🗑️ 手动移除组件缓存:', pathToRemove)
      const cached = componentCache.get(pathToRemove)
      if (cached) {
        if (cached.root) {
          cached.root.unmount()
        }
        if (cached.container && cached.container.parentNode) {
          cached.container.parentNode.removeChild(cached.container)
        }
        componentCache.delete(pathToRemove)
        forceUpdate()
      }
    }

    const handleRefresh = (event: CustomEvent) => {
      const pathToRefresh = event.detail.key
      console.log('🔄 手动刷新组件缓存:', pathToRefresh)
      const cached = componentCache.get(pathToRefresh)
      if (cached) {
        if (cached.root) {
          cached.root.unmount()
        }
        if (cached.container && cached.container.parentNode) {
          cached.container.parentNode.removeChild(cached.container)
        }
        componentCache.delete(pathToRefresh)
        forceUpdate()
      }
    }

    window.addEventListener('tab-remove', handleRemove as EventListener)
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    
    return () => {
      window.removeEventListener('tab-remove', handleRemove as EventListener)
      window.removeEventListener('tab-refresh', handleRefresh as EventListener)
    }
  }, [forceUpdate])

  // 渲染所有缓存的容器
  const renderCachedContainers = useMemo(() => {
    console.log('🎨 重新计算容器渲染列表')
    
    return Array.from(componentCache.entries()).map(([path, cached]) => {
      // 只有当前活跃的路径才需要在这里处理容器的显示
      if (cached.isActive && containerRef.current && !containerRef.current.contains(cached.container)) {
        console.log(`📦 添加缓存容器到DOM: ${path}`)
        containerRef.current.appendChild(cached.container)
      }
      return null
    })
  }, [renderKey])

  return (
    <div 
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    >
      {renderCachedContainers}
      {/* 如果当前路径没有缓存，直接渲染 */}
      {!componentCache.has(location.pathname) && (
        <div style={{ height: '100%', width: '100%' }}>
          {(() => {
            console.log('🆕 直接渲染新组件:', location.pathname)
            return children
          })()}
        </div>
      )}
    </div>
  )
}