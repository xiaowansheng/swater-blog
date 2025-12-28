import { Layout, Dropdown, Avatar, Space, Badge, Button, Tooltip } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  GithubOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import NotificationBell from './NotificationBell'
import type { MenuProps } from 'antd'
import { useState } from 'react'

const { Header: AntHeader } = Layout

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
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
    <AntHeader className="bg-white flex items-center justify-between px-6 border-b border-gray-100 h-14">
      <div className="flex items-center gap-4">
        <span className="text-lg font-medium text-gray-700">
          欢迎回来，{user?.nickname || user?.username || '管理员'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip title="帮助文档">
          <Button
            type="text"
            icon={<QuestionCircleOutlined className="text-gray-500" />}
            className="flex items-center justify-center"
          />
        </Tooltip>
        <Tooltip title="GitHub">
          <Button
            type="text"
            icon={<GithubOutlined className="text-gray-500" />}
            className="flex items-center justify-center"
            onClick={() => window.open('https://github.com', '_blank')}
          />
        </Tooltip>
        <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
          <Button
            type="text"
            icon={
              isFullscreen ? (
                <FullscreenExitOutlined className="text-gray-500" />
              ) : (
                <FullscreenOutlined className="text-gray-500" />
              )
            }
            className="flex items-center justify-center"
            onClick={toggleFullscreen}
          />
        </Tooltip>
        <NotificationBell />
        <div className="w-px h-6 bg-gray-200 mx-2" />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
            <Avatar
              src={user?.avatar}
              icon={<UserOutlined />}
              size={32}
              className="bg-blue-500"
            />
            <span className="text-gray-700 font-medium">
              {user?.nickname || user?.username}
            </span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header
