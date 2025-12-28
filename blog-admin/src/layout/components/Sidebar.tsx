import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
  CommentOutlined,
  MessageOutlined,
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  SettingOutlined,
  FileOutlined,
  EyeOutlined,
  FileSearchOutlined,
  LinkOutlined,
  BellOutlined,
  PictureOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import type { MenuProps } from 'antd'

const { Sider } = Layout

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'content',
    icon: <FileTextOutlined />,
    label: '内容管理',
    children: [
      { key: '/article', icon: <FileTextOutlined />, label: '文章管理' },
      { key: '/category', icon: <FolderOutlined />, label: '分类管理' },
      { key: '/tag', icon: <TagsOutlined />, label: '标签管理' },
      { key: '/talk', icon: <MessageOutlined />, label: '说说管理' },
    ],
  },
  {
    key: 'interaction',
    icon: <CommentOutlined />,
    label: '互动管理',
    children: [
      { key: '/comment', icon: <CommentOutlined />, label: '评论管理' },
      { key: '/guestbook', icon: <BookOutlined />, label: '留言管理' },
      { key: '/friend-link', icon: <LinkOutlined />, label: '友链管理' },
    ],
  },
  {
    key: 'media',
    icon: <PictureOutlined />,
    label: '媒体管理',
    children: [
      { key: '/file', icon: <FileOutlined />, label: '文件管理' },
      { key: '/album', icon: <PictureOutlined />, label: '相册管理' },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/user', icon: <UserOutlined />, label: '用户管理' },
      { key: '/role', icon: <TeamOutlined />, label: '角色管理' },
      { key: '/menu', icon: <MenuOutlined />, label: '菜单管理' },
      { key: '/config', icon: <SettingOutlined />, label: '系统配置' },
      { key: '/about', icon: <InfoCircleOutlined />, label: '关于页面' },
    ],
  },
  {
    key: 'monitor',
    icon: <EyeOutlined />,
    label: '监控管理',
    children: [
      { key: '/visitor', icon: <EyeOutlined />, label: '访客统计' },
      { key: '/log/operation', icon: <FileSearchOutlined />, label: '操作日志' },
      { key: '/log/error', icon: <FileSearchOutlined />, label: '异常日志' },
    ],
  },
  {
    key: '/notification',
    icon: <BellOutlined />,
    label: '通知管理',
  },
]

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const handleMenuClick = ({ key }: { key: string }) => {
    if (!key.startsWith('/')) return
    navigate(key)
  }

  const getSelectedKeys = () => {
    const path = location.pathname
    if (path.startsWith('/article/')) {
      return ['/article']
    }
    return [path]
  }

  const getOpenKeys = () => {
    const path = location.pathname
    if (['/article', '/category', '/tag', '/talk'].some(p => path.startsWith(p))) {
      return ['content']
    }
    if (['/comment', '/guestbook', '/friend-link'].some(p => path.startsWith(p))) {
      return ['interaction']
    }
    if (['/file', '/album'].some(p => path.startsWith(p))) {
      return ['media']
    }
    if (['/user', '/role', '/menu', '/config', '/about'].some(p => path.startsWith(p))) {
      return ['system']
    }
    if (['/visitor', '/log'].some(p => path.startsWith(p))) {
      return ['monitor']
    }
    return []
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={220}
      className="h-screen"
      style={{
        overflow: 'auto',
        position: 'sticky',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          {!collapsed && (
            <span className="text-white text-lg font-semibold">Blog Admin</span>
          )}
        </div>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={collapsed ? [] : getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  )
}

export default Sidebar
