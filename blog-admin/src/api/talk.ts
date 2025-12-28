import request from './request'
import { Talk, PageResult } from '@/types'

export interface TalkDTO {
  content: string
  images?: string[]
  isTop?: number
  status?: number
}

export const getTalkList = (params: {
  page?: number
  size?: number
  status?: number
}): Promise<PageResult<Talk>> => {
  return request.get('/admin/talk/list', { params })
}

export const getTalkById = (id: number): Promise<Talk> => {
  return request.get(`/admin/talk/${id}`)
}

export const createTalk = (data: TalkDTO): Promise<number> => {
  return request.post('/admin/talk', data)
}

export const updateTalk = (id: number, data: TalkDTO): Promise<void> => {
  return request.put(`/admin/talk/${id}`, data)
}

export const deleteTalk = (id: number): Promise<void> => {
  return request.delete(`/admin/talk/${id}`)
}

export const publishTalk = (id: number): Promise<void> => {
  return request.post(`/admin/talk/${id}/publish`)
}

export const unpublishTalk = (id: number): Promise<void> => {
  return request.post(`/admin/talk/${id}/unpublish`)
}
