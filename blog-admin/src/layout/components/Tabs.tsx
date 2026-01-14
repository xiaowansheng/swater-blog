import { Tabs as AntTabs, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTabsStore } from '@/store/tabs'
import { useEffect } from 'react'

const Tabs: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { tabs, activeKey, setActiveTab, removeTab, closeOtherTabs, closeLeftTabs, closeRightTabs, closeAllTabs, refreshTab } = useTabsStore()

  useEffect(() => {
    setActiveTab(location.pathname)
  }, [location.pathname, setActiveTab])

  const getContextMenus = (key: string): MenuProps => {
    const isDashboard = key === '/dashboard'
    return {
      items: [
        {
          key: 'closeOther',
          label: '关闭其他',
          disabled: tabs.length <= 1 || (tabs.length === 2 && isDashboard),
        },
        {
          key: 'closeLeft',
          label: '关闭左侧',
          disabled: isDashboard || tabs.indexOf(tabs.find((t) => t.key === key)!) === 0 || (tabs.indexOf(tabs.find((t) => t.key === key)!) === 1 && tabs[0].key === '/dashboard'),
        },
        {
          key: 'closeRight',
          label: '关闭右侧',
          disabled: tabs.indexOf(tabs.find((t) => t.key === key)!) === tabs.length - 1,
        },
        {
          type: 'divider',
        },
        {
          key: 'closeAll',
          label: '关闭全部',
          disabled: tabs.length === 0 || (tabs.length === 1 && isDashboard),
        },
      ],
      onClick: ({ key: menuKey }) => {
        switch (menuKey) {
          case 'closeOther':
            closeOtherTabs(key)
            if (key !== activeKey) {
              navigate(key)
            }
            break
          case 'closeLeft':
            closeLeftTabs(key)
            if (!tabs.slice(0, tabs.indexOf(tabs.find((t) => t.key === key)!)).find((t) => t.key === activeKey)) {
              if (key !== activeKey) {
                navigate(key)
              }
            }
            break
          case 'closeRight':
            closeRightTabs(key)
            if (!tabs.slice(tabs.indexOf(tabs.find((t) => t.key === key)!) + 1).find((t) => t.key === activeKey)) {
              if (key !== activeKey) {
                navigate(key)
              }
            }
            break
          case 'closeAll':
            closeAllTabs()
            navigate('/dashboard')
            break
        }
      }
    }
  }

  const handleChange = (key: string) => {
    navigate(key)
  }

  const handleEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: 'add' | 'remove'
  ) => {
    if (action === 'remove' && typeof targetKey === 'string') {
      // 不允许关闭仪表盘标签
      if (targetKey === '/dashboard') return
      
      const currentIndex = tabs.findIndex((tab) => tab.key === targetKey)
      removeTab(targetKey)

      // 如果关闭的是当前标签，跳转到相邻标签
      if (targetKey === activeKey && tabs.length > 1) {
        const newIndex = currentIndex === 0 ? 1 : currentIndex - 1
        const newTab = tabs[newIndex]
        if (newTab) {
          navigate(newTab.path)
        }
      }
    }
  }

  const handleRefresh = (e: React.MouseEvent, key: string) => {
    e.stopPropagation() // 阻止事件冒泡，避免触发标签切换
    refreshTab(key)
  }

  if (tabs.length === 0) {
    return null
  }

  // 确保仪表盘标签始终在第一个位置
  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.key === '/dashboard') return -1
    if (b.key === '/dashboard') return 1
    return 0
  })

  return (
    <div className="tabs-container">
      <AntTabs
        type="editable-card"
        hideAdd
        activeKey={activeKey}
        onChange={handleChange}
        onEdit={handleEdit}
        items={sortedTabs.map((tab) => ({
          key: tab.key,
          label: (
            <Dropdown
              menu={getContextMenus(tab.key)}
              trigger={['contextMenu']}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {activeKey === tab.key && (
                  <ReloadOutlined
                    className="hover:text-blue-500 transition-colors"
                    onClick={(e) => handleRefresh(e, tab.key)}
                  />
                )}
              </span>
            </Dropdown>
          ),
          closable: tab.closable !== false,
        }))}
        size="small"
        tabBarStyle={{
          marginBottom: 0,
          height: 40,
        }}
      />
    </div>
  )
}

export default Tabs
