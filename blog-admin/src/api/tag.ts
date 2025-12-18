import request from './request'
import { Tag } from '@/types'

export interface TagDTO {
  name: string
  color: string
}

export const getTagList = (): Promise<Tag[]> => {
  return request.get('/admin/tag/list')
}

export const createTag = (data: TagDTO): Promise<number> => {
  return request.post('/admin/tag', data)
}

export const updateTag = (id: number, data: TagDTO): Promise<void> => {
  return request.put(`/admin/tag/${id}`, data)
}

export const deleteTag = (id: number): Promise<void> => {
  return request.delete(`/admin/tag/${id}`)
}

