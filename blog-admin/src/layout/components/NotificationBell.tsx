import { Badge, Dropdown, List, Empty, Button, Spin, Tooltip } from 'antd'
import { BellOutlined, CheckOutlined, WifiOutlined, DisconnectOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNotificationStore } from '@/store/notification'
import { useWebSocketStore } from '@/store/websocket'
import { NotificationReadStatus } from '@/types/enums'
import { formatDate } from '@/utils/format'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as notificationApi from '@/api/notification'
import { notificationWebSocket } from '@/websocket/notification'

const NotificationBell: React.FC = () => {
  const navigate = useNavigate()
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const { status, connectedAt, reconnectAttempts, lastError } = useWebSocketStore()
  const [loading, setLoading] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const [, setTick] = useState(0) // 用于触发实时时间更新

  useEffect(() => {
    loadNotifications()
  }, [])

  // 实时更新连接时长显示
  useEffect(() => {
    if (status === 'connected' && connectedAt) {
      const timer = setInterval(() => {
        setTick(prev => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [status, connectedAt])

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

  const handleManualReconnect = () => {
    notificationWebSocket.manualReconnect()
  }

  const shouldShowReconnectButton = () => {
    return status === 'disconnected' && lastError === '重连次数已达上限'
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

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <WifiOutlined className="text-green-500 text-xs" />,
          text: '已连接',
          textColor: 'text-green-600',
          iconColor: undefined, // 使用默认灰色
        }
      case 'connecting':
      case 'reconnecting':
        return {
          icon: <LoadingOutlined className="text-yellow-500 text-xs" />,
          text: status === 'connecting' ? '连接中' : '重连中',
          textColor: 'text-yellow-600',
          iconColor: '#eab308', // yellow-500
        }
      case 'disconnected':
      default:
        return {
          icon: <DisconnectOutlined className="text-red-500 text-xs" />,
          text: '未连接',
          textColor: 'text-red-600',
          iconColor: '#ef4444', // red-500
        }
    }
  }

  const getConnectionInfo = () => {
    if (status === 'connected' && connectedAt) {
      const duration = Math.floor((Date.now() - connectedAt) / 1000)
      if (duration < 60) return `已连接 ${duration} 秒`
      if (duration < 3600) return `已连接 ${Math.floor(duration / 60)} 分钟`
      return `已连接 ${Math.floor(duration / 3600)} 小时`
    }
    if (status === 'reconnecting' && reconnectAttempts > 0) {
      return `重连尝试 ${reconnectAttempts}/5`
    }
    if (lastError) {
      return lastError
    }
    return ''
  }

  const statusConfig = getStatusConfig()
  const connectionInfo = getConnectionInfo()

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

      {/* WebSocket 状态显示 */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${statusConfig.textColor} bg-gray-50`}>
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <span className="text-sm font-medium">{statusConfig.text}</span>
          {connectionInfo && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">{connectionInfo}</span>
            </>
          )}
        </div>
        {shouldShowReconnectButton() && (
          <Button
            type="primary"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleManualReconnect}
            className="text-xs"
          >
            重连
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
                item.isRead === NotificationReadStatus.UNREAD ? 'bg-blue-50' : ''
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
                {item.isRead === NotificationReadStatus.UNREAD && (
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
      <Tooltip title={`通知系统: ${statusConfig.text}${connectionInfo ? ` (${connectionInfo})` : ''}`}>
        <div className="relative p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-100">
          <Badge count={unreadCount} size="small" offset={[-2, 2]}>
            <BellOutlined
              className={`text-xl ${statusConfig.iconColor ? '' : 'text-gray-500'} ${hasNew ? 'bell-ring' : ''}`}
              style={statusConfig.iconColor ? { color: statusConfig.iconColor } : undefined}
            />
          </Badge>
        </div>
      </Tooltip>
    </Dropdown>
  )
}

export default NotificationBell
