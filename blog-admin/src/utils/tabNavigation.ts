import { TabItem } from '@/types'
import { useTabsStore } from '@/store/tabs'

export function sortTabsForDisplay(tabs: TabItem[]) {
  return [...tabs].sort((a, b) => {
    if (a.key === '/welcome') return -1
    if (b.key === '/welcome') return 1
    return 0
  })
}

export function getNextPathAfterClose(
  tabs: TabItem[],
  targetKey: string,
  fallbackPath: string = '/welcome'
) {
  const sortedTabs = sortTabsForDisplay(tabs)
  if (sortedTabs.length <= 1) return fallbackPath

  const currentIndex = sortedTabs.findIndex((t) => t.key === targetKey)
  if (currentIndex < 0) return fallbackPath

  const newIndex = currentIndex === 0 ? 1 : currentIndex - 1
  return sortedTabs[newIndex]?.path || fallbackPath
}

/**
 * 登录成功后恢复挂起前的标签页。
 * 有缓存标签时恢复并返回应跳转的路径（之前的活跃标签），无缓存时返回 null。
 */
export function restoreSessionTabs(): string | null {
  const { cachedTabs, restoreTabs, clearCachedTabs } = useTabsStore.getState()
  if (cachedTabs.length === 0) return null

  restoreTabs()
  const path = useTabsStore.getState().activeKey
  clearCachedTabs()
  return path || null
}

