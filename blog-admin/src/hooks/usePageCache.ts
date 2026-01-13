import { useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

interface PageCacheData {
  [key: string]: any
}

interface PageCacheEntry {
  path: string
  data: PageCacheData
  timestamp: number
}

// 全局页面缓存
const pageCache = new Map<string, PageCacheEntry>()
const MAX_CACHE = 20

export const usePageCache = (cacheKey?: string) => {
  const location = useLocation()
  const key = cacheKey || location.pathname
  const dataRef = useRef<PageCacheData>({})
  const isFirstRender = useRef(true)

  console.log('🎯 usePageCache:', {
    key,
    cacheSize: pageCache.size,
    isFirstRender: isFirstRender.current,
    hasCache: pageCache.has(key)
  })

  // 获取缓存数据
  const getCachedData = useCallback((dataKey: string) => {
    const cached = pageCache.get(key)
    return cached?.data[dataKey]
  }, [key])

  // 设置缓存数据
  const setCachedData = useCallback((dataKey: string, value: any) => {
    console.log('💾 设置缓存数据:', { key, dataKey, value })
    
    let cached = pageCache.get(key)
    if (!cached) {
      // 清理超出限制的缓存
      if (pageCache.size >= MAX_CACHE) {
        const sortedEntries = Array.from(pageCache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        
        const keysToDelete = sortedEntries.slice(0, pageCache.size - MAX_CACHE + 1)
        keysToDelete.forEach(([cacheKey]) => {
          console.log('🗑️ 清理旧页面缓存:', cacheKey)
          pageCache.delete(cacheKey)
        })
      }

      cached = {
        path: key,
        data: {},
        timestamp: Date.now()
      }
      pageCache.set(key, cached)
    }

    cached.data[dataKey] = value
    cached.timestamp = Date.now()
    dataRef.current[dataKey] = value
  }, [key])

  // 清除缓存数据
  const clearCachedData = useCallback((dataKey?: string) => {
    console.log('🗑️ 清除缓存数据:', { key, dataKey })
    
    const cached = pageCache.get(key)
    if (cached) {
      if (dataKey) {
        delete cached.data[dataKey]
        delete dataRef.current[dataKey]
      } else {
        cached.data = {}
        dataRef.current = {}
      }
    }
  }, [key])

  // 检查是否有缓存数据
  const hasCachedData = useCallback((dataKey: string) => {
    const cached = pageCache.get(key)
    return cached && dataKey in cached.data
  }, [key])

  // 获取所有缓存数据
  const getAllCachedData = useCallback(() => {
    const cached = pageCache.get(key)
    return cached?.data || {}
  }, [key])

  // 初始化时恢复缓存数据
  useEffect(() => {
    const cached = pageCache.get(key)
    if (cached && isFirstRender.current) {
      console.log('📦 恢复缓存数据:', { key, data: cached.data })
      dataRef.current = { ...cached.data }
      isFirstRender.current = false
    } else if (isFirstRender.current) {
      console.log('🆕 首次访问页面:', key)
      isFirstRender.current = false
    }
  }, [key])

  // 监听标签页清理事件
  useEffect(() => {
    const handleRemove = (event: CustomEvent) => {
      if (event.detail.key === key) {
        console.log('🗑️ 手动移除页面缓存:', key)
        pageCache.delete(key)
      }
    }

    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.key === key) {
        console.log('🔄 手动刷新页面缓存:', key)
        pageCache.delete(key)
      }
    }

    window.addEventListener('tab-remove', handleRemove as EventListener)
    window.addEventListener('tab-refresh', handleRefresh as EventListener)
    
    return () => {
      window.removeEventListener('tab-remove', handleRemove as EventListener)
      window.removeEventListener('tab-refresh', handleRefresh as EventListener)
    }
  }, [key])

  return {
    getCachedData,
    setCachedData,
    clearCachedData,
    hasCachedData,
    getAllCachedData,
    isFirstVisit: isFirstRender.current,
    cacheKey: key
  }
}