import { create } from 'zustand'
import { TabItem } from '@/types'

interface TabsState {
  tabs: TabItem[]
  activeKey: string
  addTab: (tab: TabItem) => void
  removeTab: (key: string) => void
  setActiveTab: (key: string) => void
  closeOtherTabs: (key: string) => void
  closeAllTabs: () => void
  refreshTab: (key: string) => void
  getCachedTabs: () => string[]
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeKey: '',
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
  },
  setActiveTab: (key) => {
    set({ activeKey: key })
  },
  closeOtherTabs: (key) => {
    const { tabs } = get()
    const newTabs = tabs.filter((t) => t.key === key)
    set({ tabs: newTabs, activeKey: key })
  },
  closeAllTabs: () => {
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
}))

