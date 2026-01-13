import { useNotificationStore } from '@/store/notification'
import { useWebSocketStore } from '@/store/websocket'
import config from '@/config'
import { getToken } from '@/utils/storage'
import * as notificationApi from '@/api/notification'

class NotificationWebSocket {
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  connect() {
    const wsUrl = config.wsBaseUrl
    const token = getToken()
    const { setStatus, setReconnectAttempts } = useWebSocketStore.getState()

    if (!token) {
      console.warn('未找到Token，无法建立 WebSocket 连接')
      setStatus('disconnected')
      return
    }

    const normalizedBase = wsUrl.endsWith('/ws') ? wsUrl.slice(0, -3) : wsUrl
    const url = `${normalizedBase}/ws/notification?token=${encodeURIComponent(token)}`

    try {
      setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting')
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket 连接已建立')
        this.reconnectAttempts = 0
        setReconnectAttempts(0)
        setStatus('connected')
        const timestamp = Date.now()
        useWebSocketStore.getState().setConnectedAt(timestamp)
        useWebSocketStore.getState().setLastError(null)
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('解析 WebSocket 消息失败', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误', error)
        useWebSocketStore.getState().setLastError('连接错误')
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket 连接已关闭', event.code, event.reason)
        this.stopHeartbeat()
        setStatus('disconnected')

        if (event.code === 4001 || event.reason === 'Unauthorized') {
          console.error('WebSocket 认证失败，停止重连')
          useWebSocketStore.getState().setLastError('认证失败')
          return
        }

        this.reconnect()
      }
    } catch (error) {
      console.error('WebSocket 连接失败', error)
      setStatus('disconnected')
      useWebSocketStore.getState().setLastError('连接失败')
      this.reconnect()
    }
  }

  private handleMessage(data: any) {
    if (data?.type === 'pong') return

    notificationApi
      .getNotifications({ page: 1, size: 10 })
      .then((result) => {
        const { setNotifications } = useNotificationStore.getState()
        setNotifications(result.records)
      })
      .catch((error) => {
        console.error('刷新通知失败', error)
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
    const { setStatus, setReconnectAttempts } = useWebSocketStore.getState()

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket 重连次数已达上限')
      setStatus('disconnected')
      useWebSocketStore.getState().setLastError('重连次数已达上限')
      return
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      setReconnectAttempts(this.reconnectAttempts)
      console.log(`WebSocket 重连尝试 ${this.reconnectAttempts}`)
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
    useWebSocketStore.getState().reset()
  }
}

export const notificationWebSocket = new NotificationWebSocket()

