import { Badge, Dropdown, List, Empty, Button, Spin } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import { useNotificationStore } from '@/store/notification'
import { formatDate } from '@/utils/format'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as notificationApi from '@/api/notification'

const NotificationBell: React.FC = () => {
  const navigate = useNavigate()
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const [loading, setLoading] = useState(false)
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
    if (unreadCount > 0) {
      setHasNew(true)
      const timer = setTimeout(() => setHasNew(false), 500)
      return () => clearTimeout(timer)
    }
  }, [unreadCount])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const result = await notificationApi.getNotifications({ page: 1, size: 10 })
      setNotifications(result.records)
    } catch (error) {
      console.error('加载通知失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      markAsRead(id)
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      markAllAsRead()
    } catch (error) {
      console.error('标记全部已读失败', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      comment: '💬',
      like: '❤️',
      system: '🔔',
      article: '📝',
    }
    return iconMap[type] || '📢'
  }

  const dropdownContent = (
    <div className="w-80 bg-white rounded-lg border shadow-lg">
      <div className="flex justify-between items-center p-3 border-b">
        <span className="font-semibold">通知</span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
          >
            全部已读
          </Button>
        )}
      </div>
      {loading ? (
        <div className="p-8 text-center">
          <Spin />
        </div>
      ) : (
        <List
          dataSource={notifications.slice(0, 5)}
          locale={{ emptyText: <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          renderItem={(item) => (
            <List.Item
              className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                item.isRead === 0 ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleMarkAsRead(item.id)}
            >
              <div className="flex gap-3 items-start px-3 py-2 w-full">
                <span className="text-xl">{getNotificationIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  <div className="text-xs text-gray-500 truncate">{item.content}</div>
                  <div className="mt-1 text-xs text-gray-400">
                    {formatDate(item.createTime)}
                  </div>
                </div>
                {item.isRead === 0 && (
                  <span className="flex-shrink-0 mt-2 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </List.Item>
          )}
        />
      )}
      {notifications.length > 0 && (
        <div className="p-2 text-center border-t">
          <Button type="link" onClick={() => navigate('/notification')}>
            查看全部通知
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dropdown
      menu={{ items: [] }}
      popupRender={() => dropdownContent}
      placement="bottomRight"
      trigger={['click']}
    >
      <div className="relative p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-100">
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <BellOutlined
            className={`text-xl text-gray-500 ${hasNew ? 'bell-ring' : ''}`}
          />
        </Badge>
      </div>
    </Dropdown>
  )
}

export default NotificationBell
