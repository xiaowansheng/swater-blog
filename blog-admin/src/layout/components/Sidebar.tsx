import { Layout, Menu, Drawer } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import type { MenuProps } from 'antd'
import { useAuthStore } from '@/store/auth'
import {
  routeConfig,
  menuGroups,
  hasRouteAccess,
  resolveMenuKey,
  resolveGroupKeys,
} from '@/config/routes'
import type { MenuGroupKey } from '@/config/routes'

const { Sider } = Layout

type MenuItem = NonNullable<MenuProps['items']>[number]

/**
 * 由 routeConfig 派生侧边栏菜单：
 * 带 icon 的路由即菜单项（group 决定分组，无 group 为顶级项），
 * 并按当前用户角色过滤无权访问的页面。
 */
function buildMenuItems(user: ReturnType<typeof useAuthStore.getState>['user']): MenuItem[] {
  const visible = routeConfig.filter((r) => r.icon && hasRouteAccess(r, user))

  const groupItems = new Map<MenuGroupKey, MenuItem[]>()
  const standaloneItems: MenuItem[] = []

  for (const route of visible) {
    const item: MenuItem = { key: route.path, icon: route.icon, label: route.title }
    if (route.group) {
      const list = groupItems.get(route.group) ?? []
      list.push(item)
      groupItems.set(route.group, list)
    } else {
      standaloneItems.push(item)
    }
  }

  const items: MenuItem[] = menuGroups
    .filter((g) => groupItems.has(g.key))
    .map((g) => ({
      key: g.key,
      icon: g.icon,
      label: g.label,
      children: groupItems.get(g.key),
    }))

  return [...items, ...standaloneItems]
}

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobile: boolean
  drawerVisible: boolean
  setDrawerVisible: (visible: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  isMobile,
  drawerVisible,
  setDrawerVisible,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  const menuItems = useMemo(() => buildMenuItems(user), [user])

  // 导航时自动展开对应分组，同时保留用户手动展开/收起的状态
  const [openKeys, setOpenKeys] = useState<MenuProps['openKeys']>(() =>
    resolveGroupKeys(location.pathname),
  )
  useEffect(() => {
    const keys = resolveGroupKeys(location.pathname)
    if (keys.length === 0) return
    setOpenKeys((prev) => Array.from(new Set([...(prev ?? []), ...keys])))
  }, [location.pathname])

  const selectedKeys = useMemo(() => {
    const key = resolveMenuKey(location.pathname)
    return key ? [key] : []
  }, [location.pathname])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (!String(key).startsWith('/')) return
    navigate(String(key))
    if (isMobile) {
      setDrawerVisible(false)
    }
  }

  const renderContent = (isDrawer = false) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          {(!collapsed || isDrawer) && (
            <span className="text-lg font-semibold text-white">Blog Admin</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          // 折叠时 rc-menu 切换为 vertical 弹出模式，openKeys 必须交回内部管理，
          // 受控传 [] 会导致悬停时弹出式子菜单无法打开
          openKeys={(collapsed && !isDrawer) ? undefined : openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          items={menuItems}
          onClick={handleMenuClick}
          className="h-full overflow-y-auto overflow-x-hidden !border-r-0"
        />
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={220}
        styles={{ body: { padding: 0, background: '#001529' } }}
      >
        {renderContent(true)}
      </Drawer>
    )
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={220}
      className="sticky left-0 top-0 h-screen"
    >
      {renderContent(false)}
    </Sider>
  )
}

export default Sidebar
