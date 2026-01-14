import { TabItem } from '@/types'

export function sortTabsForDisplay(tabs: TabItem[]) {
  return [...tabs].sort((a, b) => {
    if (a.key === '/dashboard') return -1
    if (b.key === '/dashboard') return 1
    return 0
  })
}

export function getNextPathAfterClose(
  tabs: TabItem[],
  targetKey: string,
  fallbackPath: string = '/dashboard'
) {
  const sortedTabs = sortTabsForDisplay(tabs)
  if (sortedTabs.length <= 1) return fallbackPath

  const currentIndex = sortedTabs.findIndex((t) => t.key === targetKey)
  if (currentIndex < 0) return fallbackPath

  const newIndex = currentIndex === 0 ? 1 : currentIndex - 1
  return sortedTabs[newIndex]?.path || fallbackPath
}

