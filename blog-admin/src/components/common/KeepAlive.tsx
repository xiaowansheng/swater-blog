import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface KeepAliveProps {
  children: React.ReactNode
  cacheKey: string
  maxCache?: number
}

const cacheMap = new Map<string, { element: React.ReactNode; scrollTop: number }>()
const MAX_CACHE = 10

export const KeepAlive: React.FC<KeepAliveProps> = ({ children, cacheKey, maxCache = MAX_CACHE }) => {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [cacheKeyState, setCacheKeyState] = useState(cacheKey)

  useEffect(() => {
    if (cacheKey !== cacheKeyState) {
      if (cacheMap.has(cacheKeyState)) {
        const cache = cacheMap.get(cacheKeyState)!
        if (containerRef.current) {
          containerRef.current.scrollTop = cache.scrollTop
        }
      }
      setCacheKeyState(cacheKey)
    }
  }, [cacheKey, cacheKeyState])

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current && cacheMap.has(cacheKeyState)) {
        const cache = cacheMap.get(cacheKeyState)!
        cache.scrollTop = containerRef.current.scrollTop
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [cacheKeyState])

  useEffect(() => {
    if (!cacheMap.has(cacheKey)) {
      if (cacheMap.size >= maxCache) {
        const firstKey = cacheMap.keys().next().value
        cacheMap.delete(firstKey)
      }
      cacheMap.set(cacheKey, { element: children, scrollTop: 0 })
    } else {
      const cache = cacheMap.get(cacheKey)!
      cache.element = children
    }
  }, [children, cacheKey, maxCache])

  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
        cacheMap.delete(cacheKey)
        setCacheKeyState(cacheKey)
      }
    }

    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    return () => {
      window.removeEventListener('tab-refresh', handleRefresh as EventListener)
    }
  }, [cacheKey])

  const cache = cacheMap.get(cacheKeyState)
  const isActive = cacheKeyState === cacheKey

  return (
    <div
      ref={containerRef}
      style={{
        display: isActive ? 'block' : 'none',
        height: '100%',
        overflow: 'auto',
      }}
    >
      {cache?.element || children}
    </div>
  )
}

