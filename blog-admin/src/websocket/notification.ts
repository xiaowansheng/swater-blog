import { useAuthStore } from '@/store/auth'
import { useNotificationStore } from '@/store/notification'
import config from '@/config'

class NotificationWebSocket {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  connect() {
    const wsUrl = config.wsBaseUrl
    const url = `${wsUrl}/ws/notification`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket连接已建立')
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('解析WebSocket消息失败', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket错误', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket连接已关闭')
        this.stopHeartbeat()
        this.reconnect()
      }
    } catch (error) {
      console.error('WebSocket连接失败', error)
      this.reconnect()
    }
  }

  private handleMessage(data: any) {
    const { addNotification } = useNotificationStore.getState()
    addNotification({
      id: Date.now(),
      type: data.type || 'system',
      title: data.title || '通知',
      content: data.content || '',
      isRead: 0,
      createTime: new Date().toISOString(),
    })
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket重连次数已达上限')
      return
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`WebSocket重连尝试 ${this.reconnectAttempts}`)
      this.connect()
    }, this.reconnectDelay)
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const notificationWebSocket = new NotificationWebSocket()

