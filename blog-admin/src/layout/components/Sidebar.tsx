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
    key: '/article',
    icon: <FileTextOutlined />,
    label: '文章管理',
  },
  {
    key: '/category',
    icon: <FolderOutlined />,
    label: '分类管理',
  },
  {
    key: '/tag',
    icon: <TagsOutlined />,
    label: '标签管理',
  },
  {
    key: '/comment',
    icon: <CommentOutlined />,
    label: '评论管理',
  },
  {
    key: '/talk',
    icon: <MessageOutlined />,
    label: '说说管理',
  },
  {
    key: '/user',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/role',
    icon: <TeamOutlined />,
    label: '角色管理',
  },
  {
    key: '/menu',
    icon: <MenuOutlined />,
    label: '菜单管理',
  },
  {
    key: '/config',
    icon: <SettingOutlined />,
    label: '系统配置',
  },
  {
    key: '/file',
    icon: <FileOutlined />,
    label: '文件管理',
  },
  {
    key: '/visitor',
    icon: <EyeOutlined />,
    label: '访客管理',
  },
  {
    key: '/log',
    icon: <FileSearchOutlined />,
    label: '日志管理',
    children: [
      { key: '/log/operation', label: '操作日志' },
      { key: '/log/error', label: '异常日志' },
    ],
  },
  {
    key: '/friend-link',
    icon: <LinkOutlined />,
    label: '友链管理',
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
    navigate(key)
  }

  const getSelectedKeys = () => {
    const path = location.pathname
    if (path.startsWith('/log/')) {
      return [path]
    }
    return [path.split('/').slice(0, 2).join('/')]
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={200}
      className="h-screen"
    >
      <div className="h-16 flex items-center justify-center text-white text-lg font-bold">
        {collapsed ? 'Blog' : 'Blog Admin'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  )
}

export default Sidebar

