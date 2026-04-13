import request from './request'
import { Guestbook, PageResult } from '@/types'
import { GuestbookReviewStatus, GuestbookVisibilityStatus } from '@/types/enums'

export const getGuestbookList = (params: {
  page?: number
  size?: number
  status?: GuestbookReviewStatus
  reviewStatus?: GuestbookReviewStatus
  id?: number
  userId?: number
  nickname?: string
  email?: string
  qq?: string
  isVisible?: GuestbookVisibilityStatus
  keyword?: string
  country?: string
  province?: string
  city?: string
  type?: string
  ip?: string
  device?: string
  browser?: string
  location?: string
}): Promise<PageResult<Guestbook>> => {
  // 后端使用 reviewStatus 参数
  const { status, reviewStatus, ...rest } = params
  return request.get('/admin/guestbook/list', {
    params: { ...rest, reviewStatus: status ?? reviewStatus }
  })
}

export const approveGuestbook = (id: number): Promise<void> => {
  return request.post(`/admin/guestbook/${id}/approve`)
}

export const rejectGuestbook = (id: number): Promise<void> => {
  return request.post(`/admin/guestbook/${id}/reject`)
}

export const deleteGuestbook = (id: number): Promise<void> => {
  return request.delete(`/admin/guestbook/${id}`)
}

export const deleteBatchGuestbook = (ids: number[]): Promise<void> => {
  return request.delete('/admin/guestbook/batch', { data: ids })
}

export const setVisibleGuestbook = (id: number): Promise<void> => {
  return request.post(`/admin/guestbook/${id}/set-visible`)
}

export const setHiddenGuestbook = (id: number): Promise<void> => {
  return request.post(`/admin/guestbook/${id}/set-hidden`)
}
