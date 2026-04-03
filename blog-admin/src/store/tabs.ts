import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TabItem } from '@/types'

interface TabsState {
  tabs: TabItem[]
  activeKey: string
  cachedTabs: TabItem[] // 缓存的标签页
  addTab: (tab: TabItem) => void
  updateTab: (key: string, patch: Partial<TabItem>) => void
  updateTabLabel: (key: string, label: string) => void
  removeTab: (key: string) => void
  setActiveTab: (key: string) => void
  closeOtherTabs: (key: string) => void
  closeLeftTabs: (key: string) => void
  closeRightTabs: (key: string) => void
  closeAllTabs: () => void
  refreshTab: (key: string) => void
  getCachedTabs: () => string[]
  cacheTabs: () => void // 缓存当前标签页
  restoreTabs: () => void // 恢复缓存的标签页
  clearCachedTabs: () => void // 清除缓存的标签页
}

// 默认欢迎页标签
const WELCOME_TAB: TabItem = {
  key: '/welcome',
  path: '/welcome',
  label: '欢迎页',
  closable: false,
  keepAlive: true,
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [WELCOME_TAB],
      activeKey: '/welcome',
      cachedTabs: [],
  addTab: (tab) => {
    const { tabs } = get()
    const exists = tabs.find((t) => t.key === tab.key)
    if (!exists) {
      set({ tabs: [...tabs, tab] })
    }
    set({ activeKey: tab.key })
  },
  updateTab: (key, patch) => {
    const { tabs } = get()
    const current = tabs.find((t) => t.key === key)
    if (!current) return

    // 不允许修改 key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { key: _ignoredKey, ...rest } = patch as any

    const patchKeys = Object.keys(rest)
    if (patchKeys.length === 0) return
    const isSame = patchKeys.every((k) => (current as any)[k] === (rest as any)[k])
    if (isSame) return

    set({
      tabs: tabs.map((t) => (t.key === key ? { ...t, ...rest } : t)),
    })
  },
  updateTabLabel: (key, label) => {
    const { tabs } = get()
    const current = tabs.find((t) => t.key === key)
    if (!current) return
    if (current.label === label) return
    set({ tabs: tabs.map((t) => (t.key === key ? { ...t, label } : t)) })
  },
  removeTab: (key) => {
    const { tabs, activeKey } = get()
    // 不允许关闭欢迎页标签
    if (key === '/welcome') return
    
    const newTabs = tabs.filter((t) => t.key !== key)
    let newActiveKey = activeKey
    if (activeKey === key) {
      const index = tabs.findIndex((t) => t.key === key)
      if (index > 0) {
        newActiveKey = tabs[index - 1].key
      } else if (newTabs.length > 0) {
        newActiveKey = newTabs[0].key
      } else {
        newActiveKey = ''
      }
    }
    set({ tabs: newTabs, activeKey: newActiveKey })
    
    // 清理 KeepAlive 缓存
    const event = new CustomEvent('tab-remove', { detail: { key } })
    window.dispatchEvent(event)
  },
  setActiveTab: (key) => {
    set({ activeKey: key })
  },
  closeOtherTabs: (key) => {
    const { tabs } = get()
    // 清理其他标签页的缓存
    tabs.forEach(tab => {
      if (tab.key !== key && tab.key !== '/welcome') {
        const event = new CustomEvent('tab-remove', { detail: { key: tab.key } })
        window.dispatchEvent(event)
      }
    })
    // 保留欢迎页和当前标签
    const newTabs = tabs.filter((t) => t.key === key || t.key === '/welcome')
    set({ tabs: newTabs, activeKey: key })
  },
  closeLeftTabs: (key) => {
    const { tabs, activeKey } = get()
    const index = tabs.findIndex((t) => t.key === key)
    // 清理左侧标签页的缓存（除了欢迎页）
    tabs.slice(0, index).forEach(tab => {
      if (tab.key !== '/welcome') {
        const event = new CustomEvent('tab-remove', { detail: { key: tab.key } })
        window.dispatchEvent(event)
      }
    })
    // 保留欢迎页和当前位置及右侧的标签
    const newTabs = tabs.filter((t, i) => i >= index || t.key === '/welcome')
    let newActiveKey = activeKey
    if (!newTabs.find((t) => t.key === activeKey)) {
      newActiveKey = key
    }
    set({ tabs: newTabs, activeKey: newActiveKey })
  },
  closeRightTabs: (key) => {
    const { tabs, activeKey } = get()
    const index = tabs.findIndex((t) => t.key === key)
    // 清理右侧标签页的缓存（除了欢迎页）
    tabs.slice(index + 1).forEach(tab => {
      if (tab.key !== '/welcome') {
        const event = new CustomEvent('tab-remove', { detail: { key: tab.key } })
        window.dispatchEvent(event)
      }
    })
    // 保留欢迎页和当前位置及左侧的标签
    const newTabs = tabs.filter((t, i) => i <= index || t.key === '/welcome')
    let newActiveKey = activeKey
    if (!newTabs.find((t) => t.key === activeKey)) {
      newActiveKey = key
    }
    set({ tabs: newTabs, activeKey: newActiveKey })
  },
  closeAllTabs: () => {
    const { tabs } = get()
    // 清理所有标签页的缓存（除了欢迎页）
    tabs.forEach(tab => {
      if (tab.key !== '/welcome') {
        const event = new CustomEvent('tab-remove', { detail: { key: tab.key } })
        window.dispatchEvent(event)
      }
    })
    // 只保留欢迎页标签
    set({ tabs: [WELCOME_TAB], activeKey: '/welcome' })
  },
  refreshTab: (key) => {
    const event = new CustomEvent('tab-refresh', { detail: { key } })
    window.dispatchEvent(event)
  },
  getCachedTabs: () => {
    const { tabs } = get()
    return tabs.filter((t) => t.keepAlive).map((t) => t.key)
  },
  cacheTabs: () => {
    const { tabs, activeKey } = get()
    console.log('缓存标签页:', tabs, '当前活跃标签:', activeKey)
    set({ cachedTabs: [...tabs] })
  },
  restoreTabs: () => {
    const { cachedTabs } = get()
    console.log('恢复标签页:', cachedTabs)
    if (cachedTabs.length > 0) {
      // 找到第一个标签作为默认活跃标签
      const firstTab = cachedTabs[0]
      set({ 
        tabs: [...cachedTabs], 
        activeKey: firstTab.key 
      })
    }
  },
  clearCachedTabs: () => {
    set({ cachedTabs: [] })
  },
}),
{
  name: 'tabs-storage',
  partialize: (state) => ({ 
    cachedTabs: state.cachedTabs 
  }),
}
))

