import request from './request'
import { PageResult } from '@/types'

export interface Talk {
  id: number
  content: string
  images: string[]
  isTop: boolean
  createTime: string
}

export interface TalkDTO {
  content: string
  images: string[]
  isTop: boolean
}

export const getTalkList = (params: {
  page?: number
  size?: number
}): Promise<PageResult<Talk>> => {
  return request.get('/admin/moment/list', { params })
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

