import { Layout, Dropdown, Avatar, Button, Tooltip } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  GithubOutlined,
  QuestionCircleOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useLockscreenStore } from '@/store/lockscreen'
import NotificationBell from './NotificationBell'
import type { MenuProps } from 'antd'
import { useState } from 'react'
import { getFullUrl } from '@/utils/format'

const { Header: AntHeader } = Layout

interface HeaderProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobile: boolean
  drawerVisible: boolean
  setDrawerVisible: (visible: boolean) => void
}

const Header: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
  isMobile,
  drawerVisible,
  setDrawerVisible,
}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const lockScreen = useLockscreenStore((state) => state.lockScreen)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleLockScreen = () => {
    lockScreen()
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
      onClick: () => navigate('/profile'),
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
    <AntHeader className="bg-white flex items-center justify-between px-4 sm:px-6 border-b border-gray-100 h-14 select-none">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          type="text"
          icon={isMobile ? <MenuUnfoldOutlined className="text-gray-600" /> : (collapsed ? <MenuUnfoldOutlined className="text-gray-600" /> : <MenuFoldOutlined className="text-gray-600" />)}
          onClick={() => {
            if (isMobile) {
              setDrawerVisible(!drawerVisible)
            } else {
              setCollapsed(!collapsed)
            }
          }}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:text-blue-500"
        />
        <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 hidden sm:inline-block truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
          欢迎回来，{user?.nickname || user?.username || '管理员'}
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden md:inline-block">
          <Tooltip title="帮助文档">
            <Button
              type="text"
              icon={<QuestionCircleOutlined className="text-gray-500" />}
              className="flex items-center justify-center"
            />
          </Tooltip>
        </div>
        <div className="hidden md:inline-block">
          <Tooltip title="GitHub">
            <Button
              type="text"
              icon={<GithubOutlined className="text-gray-500" />}
              className="flex items-center justify-center"
              onClick={() => window.open(import.meta.env.VITE_GITHUB_URL || 'https://github.com', '_blank')}
            />
          </Tooltip>
        </div>
        <div className="hidden sm:inline-block">
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
        </div>
        <Tooltip title="锁屏">
          <Button
            type="text"
            icon={<LockOutlined className="text-gray-500" />}
            className="flex items-center justify-center"
            onClick={handleLockScreen}
          />
        </Tooltip>
        <NotificationBell />
        <div className="w-px h-6 bg-gray-200 mx-1 sm:mx-2" />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-gray-50 px-1 sm:px-2 py-1 rounded-lg transition-colors">
            <Avatar
              src={getFullUrl(user?.avatar)}
              icon={<UserOutlined />}
              size={32}
              className="bg-blue-500"
            />
            <span className="text-gray-700 font-medium hidden sm:inline-block">
              {user?.nickname || user?.username}
            </span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header
