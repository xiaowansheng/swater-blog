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

const { Content } = Layout

// 根据路由生成面包屑
const getBreadcrumbItems = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean)

  if (pathSegments.length === 0) {
    return []
  }

  const items = [{ title: <Link to="/">首页</Link> }]

  // 路由映射表
  const routeMap: Record<string, string> = {
    article: '文章管理',
    talk: '说说管理',
    category: '分类管理',
    tag: '标签管理',
    comment: '评论管理',
    user: '用户管理',
    role: '角色管理',
    menu: '菜单管理',
    config: '系统配置',
    file: '文件管理',
    friendlink: '友链管理',
    guestbook: '留言管理',
    album: '相册管理',
    archive: '归档管理',
    log: '日志管理',
    operation: '操作日志',
    error: '错误日志',
    notification: '通知管理',
    visitor: '访客统计',
    resource: '资源管理',
    about: '关于页面',
    dashboard: '仪表盘',
    welcome: '欢迎页',
    profile: '个人资料',
  }

  // 构建面包屑路径
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1

    if (segment === 'create' || segment === 'edit') {
      items.push({ title: isLast ? <span>编辑</span> : <span>操作</span> })
    } else if (segment === 'detail') {
      items.push({ title: <span>详情</span> })
    } else if (routeMap[segment]) {
      items.push({
        title: isLast ? <span>{routeMap[segment]}</span> : <Link to={currentPath}>{routeMap[segment]}</Link>,
      })
    } else if (!isNaN(Number(segment))) {
      // ID 参数，不显示
    } else {
      items.push({
        title: isLast ? <span>{segment}</span> : <Link to={currentPath}>{segment}</Link>,
      })
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
    <Layout className="h-screen">
      <Sidebar />
      <Layout className="flex flex-col">
        <Header />
        <Tabs />
        <Content
          className={`${isWelcome ? 'overflow-hidden' : 'overflow-auto'} flex-1 bg-gray-50`}
          style={isWelcome ? { position: 'relative', padding: 0 } : undefined}
        >
          {isWelcome ? (
            <KeepAlive name={location.pathname} when={shouldCache} key={keepAliveKey}>
              <Suspense fallback={<PageLoading />}>{outlet}</Suspense>
            </KeepAlive>
          ) : (
            <div className="page-container">
              <div className="mb-4">
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
