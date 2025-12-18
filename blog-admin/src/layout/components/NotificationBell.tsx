import { Badge, Dropdown, List, Empty } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useNotificationStore } from '@/store/notification'
import { formatDate } from '@/utils/format'
import { useEffect } from 'react'
import * as notificationApi from '@/api/notification'

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, setNotifications, markAsRead } = useNotificationStore()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const result = await notificationApi.getNotifications({ page: 1, size: 10 })
      setNotifications(result.records)
    } catch (error) {
      console.error('加载通知失败', error)
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

  const dropdownContent = (
    <div className="w-80">
      <div className="p-2 border-b font-semibold">通知</div>
      <List
        dataSource={notifications}
        locale={{ emptyText: <Empty description="暂无通知" /> }}
        renderItem={(item) => (
          <List.Item
            className={item.isRead === 0 ? 'bg-blue-50' : ''}
            onClick={() => handleMarkAsRead(item.id)}
          >
            <List.Item.Meta
              title={item.title}
              description={
                <div>
                  <div>{item.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(item.createTime)}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      {notifications.length > 0 && (
        <div className="p-2 border-t text-center">
          <a onClick={() => window.location.href = '/notification'}>查看全部</a>
        </div>
      )}
    </div>
  )

  return (
    <Dropdown overlay={dropdownContent} placement="bottomRight" trigger={['click']}>
      <Badge count={unreadCount} size="small">
        <BellOutlined className="text-xl cursor-pointer" />
      </Badge>
    </Dropdown>
  )
}

export default NotificationBell

