import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import { useAuthStore } from '@/store/auth'
import { useWebSocket } from '@/hooks/useWebSocket'

const { Content } = Layout

const BasicLayout: React.FC = () => {
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
      <Layout className="flex flex-col">
        <Header />
        <Tabs />
        <Content className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout
