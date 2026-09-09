import { describe, it, expect, beforeEach } from 'vitest'
import { sortTabsForDisplay, getNextPathAfterClose, restoreSessionTabs } from '@/utils/tabNavigation'
import { useTabsStore } from '@/store/tabs'
import type { TabItem } from '@/types'

const tab = (key: string): TabItem => ({
  key,
  path: key,
  label: key,
  closable: key !== '/welcome',
  keepAlive: true,
})

describe('sortTabsForDisplay', () => {
  it('欢迎页始终排在最前', () => {
    const sorted = sortTabsForDisplay([tab('/article'), tab('/welcome'), tab('/dashboard')])
    expect(sorted[0].key).toBe('/welcome')
  })
})

describe('getNextPathAfterClose', () => {
  it('关闭中间标签后激活左侧标签', () => {
    const tabs = [tab('/welcome'), tab('/article'), tab('/tag')]
    expect(getNextPathAfterClose(tabs, '/tag')).toBe('/article')
  })

  it('关闭第一个标签后激活右侧标签', () => {
    const tabs = [tab('/welcome'), tab('/article'), tab('/tag')]
    expect(getNextPathAfterClose(tabs, '/welcome')).toBe('/article')
  })

  it('只剩一个标签时回退默认路径', () => {
    const tabs = [tab('/welcome')]
    expect(getNextPathAfterClose(tabs, '/welcome')).toBe('/welcome')
    expect(getNextPathAfterClose(tabs, '/not-exist')).toBe('/welcome')
  })
})

describe('restoreSessionTabs', () => {
  beforeEach(() => {
    useTabsStore.setState({
      tabs: [tab('/welcome')],
      activeKey: '/welcome',
      cachedTabs: [],
      cachedActiveKey: '/welcome',
    })
  })

  it('无缓存标签时返回 null', () => {
    expect(restoreSessionTabs()).toBeNull()
  })

  it('恢复缓存标签并返回之前的活跃标签', () => {
    useTabsStore.setState({
      cachedTabs: [tab('/welcome'), tab('/article'), tab('/dashboard')],
      cachedActiveKey: '/dashboard',
    })

    const path = restoreSessionTabs()

    expect(path).toBe('/dashboard')
    const { tabs, activeKey, cachedTabs } = useTabsStore.getState()
    expect(tabs.map((t) => t.key)).toEqual(['/welcome', '/article', '/dashboard'])
    expect(activeKey).toBe('/dashboard')
    expect(cachedTabs).toEqual([])
  })

  it('缓存的活跃标签已不在列表中时回退到第一个缓存标签', () => {
    // cachedActiveKey 指向的标签已不在 cachedTabs 中（异常场景兜底）
    useTabsStore.setState({
      cachedTabs: [tab('/welcome')],
      cachedActiveKey: '/article',
    })

    const path = restoreSessionTabs()
    expect(path).toBe('/welcome')
  })
})
