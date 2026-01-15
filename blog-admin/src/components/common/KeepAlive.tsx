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

const componentCache = new Map<string, CachedComponent>()
const MAX_CACHE = 10

export const KeepAlive: React.FC<KeepAliveProps> = ({
  children,
  cacheKey,
  shouldCache = true,
  maxCache = MAX_CACHE,
}) => {
  const location = useLocation()
  const [renderKey, setRenderKey] = useState(0)
  const isInitialized = useRef(false)

  console.log('KeepAlive Render:', {
    cacheKey,
    shouldCache,
    cacheSize: componentCache.size,
    allCacheKeys: Array.from(componentCache.keys()),
    currentLocation: location.pathname,
    renderKey,
  })

  const forceUpdate = () => setRenderKey((prev) => prev + 1)

  useEffect(() => {
    if (!shouldCache) {
      return
    }

    console.log('KeepAlive cache manage:', { cacheKey, isInitialized: isInitialized.current })

    componentCache.forEach((cached, key) => {
      cached.isActive = key === cacheKey
    })

    if (!componentCache.has(cacheKey)) {
      if (componentCache.size >= maxCache) {
        const sortedEntries = Array.from(componentCache.entries()).sort(
          ([, a], [, b]) => a.lastActiveTime - b.lastActiveTime
        )
        const keysToDelete = sortedEntries.slice(0, componentCache.size - maxCache + 1)
        keysToDelete.forEach(([key]) => componentCache.delete(key))
      }

      const uniqueKey = `${cacheKey}-${Date.now()}`
      componentCache.set(cacheKey, {
        key: uniqueKey,
        element: React.cloneElement(children as React.ReactElement, { key: uniqueKey }),
        isActive: true,
        lastActiveTime: Date.now(),
      })
    } else {
      const cached = componentCache.get(cacheKey)!
      cached.lastActiveTime = Date.now()
      cached.isActive = true
    }

    isInitialized.current = true
    forceUpdate()
  }, [cacheKey, maxCache, shouldCache])

  useEffect(() => {
    if (!shouldCache) {
      return
    }

    const handleRemove = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
        componentCache.delete(cacheKey)
        forceUpdate()
      }
    }

    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
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
  }, [cacheKey, shouldCache])

  const renderContent = useMemo(() => {
    if (!shouldCache) {
      return <div style={{ height: '100%' }}>{children}</div>
    }

    const cachedElements = Array.from(componentCache.entries()).map(([key, cached]) => (
      <div
        key={cached.key}
        style={{
          display: cached.isActive ? 'block' : 'none',
          height: '100%',
          width: '100%',
        }}
      >
        {cached.element}
      </div>
    ))

    if (!componentCache.has(cacheKey)) {
      cachedElements.push(
        <div key={`temp-${cacheKey}`} style={{ height: '100%', width: '100%' }}>
          {children}
        </div>
      )
    }

    return <div style={{ height: '100%', width: '100%' }}>{cachedElements}</div>
  }, [cacheKey, children, renderKey, shouldCache])

  return renderContent
}

