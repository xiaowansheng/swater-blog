import { useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { TabItem } from '@/types'
import { useTabsStore } from '@/store/tabs'

export function usePageTab() {
  const location = useLocation()

  // keep-alive 场景下，组件不会卸载；用 ref 固定“本页面首次打开时”的 tab key
  const tabKeyRef = useRef<string>(location.pathname)

  const tab = useTabsStore((s) => s.tabs.find((t) => t.key === tabKeyRef.current)) as
    | TabItem
    | undefined

  const updateTabLabel = useTabsStore((s) => s.updateTabLabel)

  const setTabLabel = useCallback(
    (label: string) => {
      updateTabLabel(tabKeyRef.current, label)
    },
    [updateTabLabel]
  )

  return {
    tabKey: tabKeyRef.current,
    tab,
    setTabLabel,
  }
}

