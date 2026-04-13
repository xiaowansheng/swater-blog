import { create } from 'zustand'
import { Notification } from '@/types'
import { NotificationReadStatus } from '@/types/enums'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  removeNotification: (id: number) => void
  clearNotifications: () => void
  setNotifications: (notifications: Notification[]) => void
  setUnreadCount: (count: number) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const { notifications } = get()
    set({
      notifications: [notification, ...notifications],
      unreadCount: notification.isRead === NotificationReadStatus.UNREAD ? get().unreadCount + 1 : get().unreadCount,
    })
  },
  markAsRead: (id) => {
    const { notifications, unreadCount } = get()
    const newNotifications = notifications.map((n) =>
      n.id === id ? { ...n, isRead: NotificationReadStatus.READ } : n
    )
    const newUnreadCount = Math.max(0, unreadCount - 1)
    set({ notifications: newNotifications, unreadCount: newUnreadCount })
  },
  markAllAsRead: () => {
    const { notifications } = get()
    const newNotifications = notifications.map((n) => ({ ...n, isRead: NotificationReadStatus.READ }))
    set({ notifications: newNotifications, unreadCount: 0 })
  },
  removeNotification: (id) => {
    const { notifications, unreadCount } = get()
    const notification = notifications.find((n) => n.id === id)
    const newNotifications = notifications.filter((n) => n.id !== id)
    const newUnreadCount = notification?.isRead === NotificationReadStatus.UNREAD ? Math.max(0, unreadCount - 1) : unreadCount
    set({ notifications: newNotifications, unreadCount: newUnreadCount })
  },
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => n.isRead === NotificationReadStatus.UNREAD).length
    set({ notifications, unreadCount })
  },
  setUnreadCount: (count) => {
    set({ unreadCount: count })
  },
}))

