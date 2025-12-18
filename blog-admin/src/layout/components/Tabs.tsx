import { Tabs as AntTabs } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTabsStore } from '@/store/tabs'
import { useEffect, useRef } from 'react'
import type { TabItem } from '@/types'

const Tabs: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { tabs, activeKey, setActiveTab, removeTab, closeOtherTabs, closeAllTabs, refreshTab } =
    useTabsStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeKey && activeKey !== location.pathname) {
      navigate(activeKey)
    }
  }, [activeKey, navigate, location.pathname])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    navigate(key)
  }

  const handleTabEdit = (targetKey: string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      removeTab(targetKey)
      if (targetKey === location.pathname) {
        const index = tabs.findIndex((t) => t.key === targetKey)
        if (index > 0) {
          navigate(tabs[index - 1].key)
        } else if (tabs.length > 1) {
          navigate(tabs[index + 1].key)
        } else {
          navigate('/dashboard')
        }
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent, tab: TabItem) => {
    e.preventDefault()
    refreshTab(tab.key)
  }

  if (tabs.length === 0) {
    return null
  }

  return (
    <div ref={containerRef} className="bg-white border-b">
      <AntTabs
        type="editable-card"
        hideAdd
        activeKey={activeKey}
        onChange={handleTabChange}
        onEdit={handleTabEdit}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: (
            <span onContextMenu={(e) => handleContextMenu(e, tab)}>{tab.label}</span>
          ),
          closable: tab.closable !== false,
        }))}
        size="small"
      />
    </div>
  )
}

export default Tabs

