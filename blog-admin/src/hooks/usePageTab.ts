import { useCallback, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TabItem } from '@/types'
import { useTabsStore } from '@/store/tabs'
import { getNextPathAfterClose } from '@/utils/tabNavigation'

export function usePageTab() {
  const location = useLocation()
  const navigate = useNavigate()

  // keep-alive 场景下，组件不会卸载；用 ref 固定“本页面首次打开时”的 tab key
  const tabKeyRef = useRef<string>(location.pathname)

  const tab = useTabsStore((s) => s.tabs.find((t) => t.key === tabKeyRef.current)) as
    | TabItem
    | undefined

  const tabs = useTabsStore((s) => s.tabs)
  const activeKey = useTabsStore((s) => s.activeKey)
  const updateTabLabel = useTabsStore((s) => s.updateTabLabel)
  const updateTab = useTabsStore((s) => s.updateTab)
  const removeTab = useTabsStore((s) => s.removeTab)
  const refreshTab = useTabsStore((s) => s.refreshTab)

  const setTabLabel = useCallback(
    (label: string) => {
      updateTabLabel(tabKeyRef.current, label)
    },
    [updateTabLabel]
  )

  const setClosable = useCallback(
    (closable: boolean) => {
      updateTab(tabKeyRef.current, { closable })
    },
    [updateTab]
  )

  const setKeepAlive = useCallback(
    (keepAlive: boolean) => {
      updateTab(tabKeyRef.current, { keepAlive })
    },
    [updateTab]
  )

  const refreshSelf = useCallback(() => {
    refreshTab(tabKeyRef.current)
  }, [refreshTab])

  const closeSelf = useCallback(
    (options?: { navigateIfActive?: boolean; fallbackPath?: string }) => {
      const tabKey = tabKeyRef.current
      if (tabKey === '/dashboard') return

      const navigateIfActive = options?.navigateIfActive ?? true
      const fallbackPath = options?.fallbackPath ?? '/dashboard'

      const isActive = activeKey === tabKey
      const shouldNavigate = navigateIfActive && isActive

      const nextPath = shouldNavigate
        ? getNextPathAfterClose(tabs, tabKey, fallbackPath)
        : null

      removeTab(tabKey)

      if (shouldNavigate && nextPath) {
        navigate(nextPath)
      }
    },
    [activeKey, navigate, removeTab, tabs]
  )

  const actions = useMemo(
    () => ({
      setTabLabel,
      setClosable,
      setKeepAlive,
      refreshSelf,
      closeSelf,
    }),
    [closeSelf, refreshSelf, setClosable, setKeepAlive, setTabLabel]
  )

  return {
    tabKey: tabKeyRef.current,
    tab,
    ...actions,
  }
}
