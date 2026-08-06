import { Layout, Spin, Breadcrumb } from 'antd'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useLocation, useOutlet, Link } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import LoginModal from '@/components/common/LoginModal'
import Lockscreen from '@/components/common/Lockscreen'
import { KeepAlive, useAliveController } from 'react-activation'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAutoLock } from '@/hooks/useAutoLock'
import { routeConfig, matchRoute } from '@/config/routes'

const { Content } = Layout

function buildSegmentTitleMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const { path, title } of routeConfig) {
    const segments = path.replace(/^\//, '').split('/')
    for (const seg of segments) {
      if (!seg.startsWith(':') && !map.has(seg)) {
        map.set(seg, title)
      }
    }
  }
  return map
}

const segmentTitleMap = buildSegmentTitleMap()

const actionLabels: Record<string, string> = {
  create: '新建',
  edit: '编辑',
  detail: '详情',
  preview: '预览',
  import: '导入',
  export: '导出',
  tree: '归类树',
  mindmap: '归类可视化',
}

// 父级分段在没有独立路由时使用的标题（如 /log/operation、/log/error 共用的 log）
const parentSegmentLabels: Record<string, string> = {
  log: '日志管理',
}

// 根据路由生成面包屑
const getBreadcrumbItems = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean)

  if (pathSegments.length === 0) {
    return [{ title: <Link to="/">首页</Link> }]
  }

  const items = [{ title: <Link to="/">首页</Link> }]

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1

    if (actionLabels[segment]) {
      items.push({
        title: <span>{actionLabels[segment]}</span>,
      })
    } else {
      const label = parentSegmentLabels[segment] ?? segmentTitleMap.get(segment)
      if (label) {
        const canLink = !isLast && matchRoute(currentPath)
        items.push({
          title: canLink ? <Link to={currentPath}>{label}</Link> : <span>{label}</span>,
        })
      } else if (!isNaN(Number(segment))) {
        // ID 参数，不显示
      } else {
        items.push({
          title: isLast ? <span>{segment}</span> : <Link to={currentPath}>{segment}</Link>,
        })
      }
    }
  })

  return items
}

const PageLoading: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <Spin size="large" />
  </div>
)

const BasicLayout: React.FC = () => {
  const { getCurrentUser, isAuthenticated } = useAuthStore()
  const { tabs } = useTabsStore()
  const location = useLocation()
  const outlet = useOutlet()
  const { drop, refresh } = useAliveController()
  const [refreshSeeds, setRefreshSeeds] = useState<Record<string, number>>({})
  const [collapsed, setCollapsed] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setDrawerVisible(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 220)
    return () => clearTimeout(timer)
  }, [collapsed])

  const bumpRefreshSeed = useCallback((key: string) => {
    setRefreshSeeds((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }))
  }, [])

  useEffect(() => {
    if (isAuthenticated()) {
      getCurrentUser()
    }
  }, [getCurrentUser, isAuthenticated])

  useWebSocket()
  useAutoLock()

  const currentTab = tabs.find((tab) => tab.key === location.pathname)
  const shouldCache = currentTab?.keepAlive ?? true

  useEffect(() => {
    const handleRemove = (event: CustomEvent) => {
      const key = event.detail?.key
      if (key) {
        drop(key)
      }
    }

    const handleRefresh = (event: CustomEvent) => {
      const key = event.detail?.key
      if (key) {
        refresh(key)
        bumpRefreshSeed(key)
      }
    }

    window.addEventListener('tab-remove', handleRemove as EventListener)
    window.addEventListener('tab-refresh', handleRefresh as EventListener)

    return () => {
      window.removeEventListener('tab-remove', handleRemove as EventListener)
      window.removeEventListener('tab-refresh', handleRefresh as EventListener)
    }
  }, [bumpRefreshSeed, drop, refresh])

  const keepAliveKey = `${location.pathname}:${refreshSeeds[location.pathname] ?? 0}`

  const isWelcome = location.pathname === '/welcome'

  return (
    <Layout className="h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
      />
      <Layout className="flex flex-col h-full overflow-hidden">
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
        <Tabs />
        <Content
          className="overflow-auto flex-1 bg-gray-50"
          style={isWelcome ? { padding: 0 } : undefined}
        >
          {isWelcome ? (
            <KeepAlive name={location.pathname} when={shouldCache} key={keepAliveKey}>
              <Suspense fallback={<PageLoading />}>{outlet}</Suspense>
            </KeepAlive>
          ) : (
            <div className="page-container animate-fade-in">
              <div className="mb-4 hidden sm:block">
                <Breadcrumb items={getBreadcrumbItems(location.pathname)} />
              </div>
              <KeepAlive name={location.pathname} when={shouldCache} key={keepAliveKey}>
                <Suspense fallback={<PageLoading />}>{outlet}</Suspense>
              </KeepAlive>
            </div>
          )}
        </Content>
      </Layout>
      <LoginModal />
      <Lockscreen />
    </Layout>
  )
}

export default BasicLayout
