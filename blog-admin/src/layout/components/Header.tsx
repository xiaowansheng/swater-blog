import { Layout, Dropdown, Avatar, Badge, Button } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import NotificationBell from './NotificationBell'
import type { MenuProps } from 'antd'

const { Header: AntHeader } = Layout

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader className="bg-white flex items-center justify-between px-4 border-b">
      <div className="text-lg font-semibold">博客管理后台</div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar src={user?.avatar} icon={<UserOutlined />} />
            <span>{user?.nickname || user?.username}</span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header

