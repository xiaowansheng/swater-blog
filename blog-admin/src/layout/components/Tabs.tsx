import { Tabs as AntTabs, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTabsStore } from '@/store/tabs'
import { useEffect, useMemo } from 'react'
import { getNextPathAfterClose, sortTabsForDisplay } from '@/utils/tabNavigation'

const Tabs: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { tabs, activeKey, setActiveTab, removeTab, closeOtherTabs, closeLeftTabs, closeRightTabs, closeAllTabs, refreshTab } = useTabsStore()
  const sortedTabs = useMemo(() => sortTabsForDisplay(tabs), [tabs])

  useEffect(() => {
    setActiveTab(location.pathname)
  }, [location.pathname, setActiveTab])

  const getContextMenus = (key: string): MenuProps => {
    const isDashboard = key === '/dashboard'
    const currentIndex = sortedTabs.findIndex((t) => t.key === key)
    return {
      items: [
        {
          key: 'closeOther',
          label: '关闭其他',
          disabled: sortedTabs.length <= 1 || (sortedTabs.length === 2 && isDashboard),
        },
        {
          key: 'closeLeft',
          label: '关闭左侧',
          disabled: isDashboard || currentIndex === 0 || (currentIndex === 1 && sortedTabs[0].key === '/dashboard'),
        },
        {
          key: 'closeRight',
          label: '关闭右侧',
          disabled: currentIndex === sortedTabs.length - 1,
        },
        {
          type: 'divider',
        },
        {
          key: 'closeAll',
          label: '关闭全部',
          disabled: sortedTabs.length === 0 || (sortedTabs.length === 1 && isDashboard),
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
            if (!sortedTabs.slice(0, currentIndex).find((t) => t.key === activeKey)) {
              if (key !== activeKey) {
                navigate(key)
              }
            }
            break
          case 'closeRight':
            closeRightTabs(key)
            if (!sortedTabs.slice(currentIndex + 1).find((t) => t.key === activeKey)) {
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
      
      const nextPath = getNextPathAfterClose(sortedTabs, targetKey, '/dashboard')
      removeTab(targetKey)

      // 如果关闭的是当前标签，跳转到相邻标签
      if (targetKey === activeKey && sortedTabs.length > 1) {
        navigate(nextPath)
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
