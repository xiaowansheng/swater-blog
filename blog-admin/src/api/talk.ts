import request from './request'
import { Talk, PageResult } from '@/types'

export interface TalkDTO {
  content: string
  images?: string[]
  isTop?: number
  status?: string
}

export const getTalkList = (params: {
  page?: number
  size?: number
  keyword?: string
  status?: string
  isTop?: number
}): Promise<PageResult<Talk>> => {
  return request.get('/admin/moment/list', { params })
}

export const getTalkById = (id: number): Promise<Talk> => {
  return request.get(`/admin/moment/${id}`)
}

export const createTalk = (data: TalkDTO): Promise<number> => {
  return request.post('/admin/moment', data)
}

export const updateTalk = (id: number, data: TalkDTO): Promise<void> => {
  return request.put(`/admin/moment/${id}`, data)
}

export const deleteTalk = (id: number): Promise<void> => {
  return request.delete(`/admin/moment/${id}`)
}

export const setTalkTop = (id: number): Promise<void> => {
  return request.post(`/admin/moment/${id}/top`)
}

export const cancelTalkTop = (id: number): Promise<void> => {
  return request.post(`/admin/moment/${id}/cancel-top`)
}
