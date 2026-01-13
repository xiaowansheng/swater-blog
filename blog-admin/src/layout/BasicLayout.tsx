import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import LoginModal from '@/components/common/LoginModal'
import Lockscreen from '@/components/common/Lockscreen'
import { useAuthStore } from '@/store/auth'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAutoLock } from '@/hooks/useAutoLock'

const { Content } = Layout

const BasicLayout: React.FC = () => {
  const { getCurrentUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated()) {
      getCurrentUser()
    }
  }, [isAuthenticated, getCurrentUser])

  useWebSocket()
  useAutoLock() // 启用自动锁屏功能，默认 30 分钟不操作自动锁屏

  return (
    <Layout className="h-screen">
      <Sidebar />
      <Layout className="flex flex-col">
        <Header />
        <Tabs />
        <Content className="overflow-auto flex-1 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
      <LoginModal />
      <Lockscreen />
    </Layout>
  )
}

export default BasicLayout
