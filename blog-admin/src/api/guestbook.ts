import request from './request'
import { Guestbook, PageResult } from '@/types'

export const getGuestbookList = (params: {
  page?: number
  size?: number
  status?: number
}): Promise<PageResult<Guestbook>> => {
  // 后端使用 reviewStatus 参数
  const { status, ...rest } = params
  return request.get('/admin/guestbook/list', { 
    params: { ...rest, reviewStatus: status } 
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
