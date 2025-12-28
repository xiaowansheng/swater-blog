import request from './request'
import { Notification, PageResult } from '@/types'

export const getNotifications = (params: {
  page?: number
  size?: number
  isRead?: number
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

