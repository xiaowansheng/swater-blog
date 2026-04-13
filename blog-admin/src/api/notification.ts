import request from './request'
import { Notification, PageResult } from '@/types'
import { NotificationReadStatus } from '@/types/enums'

export const getNotifications = (params: {
  page?: number
  size?: number
  isRead?: NotificationReadStatus
}): Promise<PageResult<Notification>> => {
  return request.get('/admin/notification', { params })
}

export const markAsRead = (id: number): Promise<void> => {
  return request.put(`/admin/notification/${id}/read`)
}

export const markAllAsRead = (): Promise<void> => {
  return request.put('/admin/notification/read-all')
}

export const deleteNotification = (id: number): Promise<void> => {
  return request.delete(`/admin/notification/${id}`)
}

export const retryNotification = (id: number): Promise<void> => {
  return request.put(`/admin/notification/${id}/retry`)
}

export const retryNotifications = (ids: number[]): Promise<void> => {
  return request.put('/admin/notification/retry', ids)
}

