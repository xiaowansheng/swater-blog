import request from './request'
import { About } from '@/types'

export const getAbout = (): Promise<About> => {
  return request.get('/admin/about')
}

export const updateAbout = (data: { title: string; content: string }): Promise<void> => {
  return request.put('/admin/about', data)
}
