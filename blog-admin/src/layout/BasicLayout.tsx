import { Layout, Spin } from 'antd'
import { Suspense, useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import LoginModal from '@/components/common/LoginModal'
import Lockscreen from '@/components/common/Lockscreen'
import { KeepAlive } from '@/components/common/KeepAlive'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAutoLock } from '@/hooks/useAutoLock'

const { Content } = Layout

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

  useEffect(() => {
    if (isAuthenticated()) {
      getCurrentUser()
    }
  }, [getCurrentUser, isAuthenticated])

  useWebSocket()
  useAutoLock()

  const currentTab = tabs.find((tab) => tab.key === location.pathname)
  const shouldCache = currentTab?.keepAlive ?? true

  return (
    <Layout className="h-screen">
      <Sidebar />
      <Layout className="flex flex-col">
        <Header />
        <Tabs />
        <Content className="overflow-auto flex-1 bg-gray-50">
          <KeepAlive cacheKey={location.pathname} shouldCache={shouldCache}>
            <Suspense fallback={<PageLoading />}>{outlet}</Suspense>
          </KeepAlive>
        </Content>
      </Layout>
      <LoginModal />
      <Lockscreen />
    </Layout>
  )
}

export default BasicLayout

