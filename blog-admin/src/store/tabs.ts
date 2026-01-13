import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TabItem } from '@/types'

interface TabsState {
  tabs: TabItem[]
  activeKey: string
  cachedTabs: TabItem[] // 缓存的标签页
  addTab: (tab: TabItem) => void
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

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeKey: '',
      cachedTabs: [],
  addTab: (tab) => {
    const { tabs } = get()
    const exists = tabs.find((t) => t.key === tab.key)
    if (!exists) {
      set({ tabs: [...tabs, tab] })
    }
    set({ activeKey: tab.key })
  },
  removeTab: (key) => {
    const { tabs, activeKey } = get()
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
      if (tab.key !== key) {
        const event = new CustomEvent('tab-remove', { detail: { key: tab.key } })
        window.dispatchEvent(event)
      }
    })
    const newTabs = tabs.filter((t) => t.key === key)
    set({ tabs: newTabs, activeKey: key })
  },
  closeLeftTabs: (key) => {
    const { tabs, activeKey } = get()
    const index = tabs.findIndex((t) => t.key === key)
    // 清理左侧标签页的缓存
    tabs.slice(0, index).forEach(tab => {
      const event = new CustomEvent('tab-remove', { detail: { key: tab.key } })
      window.dispatchEvent(event)
    })
    const newTabs = tabs.slice(index)
    let newActiveKey = activeKey
    if (!newTabs.find((t) => t.key === activeKey)) {
      newActiveKey = key
    }
    set({ tabs: newTabs, activeKey: newActiveKey })
  },
  closeRightTabs: (key) => {
    const { tabs, activeKey } = get()
    const index = tabs.findIndex((t) => t.key === key)
    // 清理右侧标签页的缓存
    tabs.slice(index + 1).forEach(tab => {
      const event = new CustomEvent('tab-remove', { detail: { key: tab.key } })
      window.dispatchEvent(event)
    })
    const newTabs = tabs.slice(0, index + 1)
    let newActiveKey = activeKey
    if (!newTabs.find((t) => t.key === activeKey)) {
      newActiveKey = key
    }
    set({ tabs: newTabs, activeKey: newActiveKey })
  },
  closeAllTabs: () => {
    const { tabs } = get()
    // 清理所有标签页的缓存
    tabs.forEach(tab => {
      const event = new CustomEvent('tab-remove', { detail: { key: tab.key } })
      window.dispatchEvent(event)
    })
    set({ tabs: [], activeKey: '' })
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

