import { Layout } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import { useAuthStore } from '@/store/auth'
import { useWebSocket } from '@/hooks/useWebSocket'

const { Content } = Layout

const BasicLayout: React.FC = () => {
  const location = useLocation()
  const { getCurrentUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated()) {
      getCurrentUser()
    }
  }, [isAuthenticated, getCurrentUser])

  useWebSocket()

  return (
    <Layout className="h-screen">
      <Sidebar />
      <Layout>
        <Header />
        <Tabs />
        <Content className="p-4 overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout

