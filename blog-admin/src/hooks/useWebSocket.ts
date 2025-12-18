import { useEffect } from 'react'
import { notificationWebSocket } from '@/websocket/notification'
import { useAuthStore } from '@/store/auth'

export const useWebSocket = () => {
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated()) {
      notificationWebSocket.connect()
      return () => {
        notificationWebSocket.disconnect()
      }
    }
  }, [isAuthenticated])
}

