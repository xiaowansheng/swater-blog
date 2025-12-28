import { Tabs as AntTabs } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTabsStore } from '@/store/tabs'
import { useEffect } from 'react'

const Tabs: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { tabs, activeKey, setActiveTab, removeTab } = useTabsStore()

  useEffect(() => {
    setActiveTab(location.pathname)
  }, [location.pathname, setActiveTab])

  const handleChange = (key: string) => {
    navigate(key)
  }

  const handleEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: 'add' | 'remove'
  ) => {
    if (action === 'remove' && typeof targetKey === 'string') {
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

  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="tabs-container">
      <AntTabs
        type="editable-card"
        hideAdd
        activeKey={activeKey}
        onChange={handleChange}
        onEdit={handleEdit}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          closable: tab.closable !== false && tabs.length > 1,
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
