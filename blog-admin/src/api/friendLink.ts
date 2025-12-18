import request from './request'
import { FriendLink } from '@/types'

export interface FriendLinkDTO {
  name: string
  url: string
  logo: string
  description: string
}

export const getFriendLinkList = (): Promise<FriendLink[]> => {
  return request.get('/admin/friend-link/list')
}

export const createFriendLink = (data: FriendLinkDTO): Promise<number> => {
  return request.post('/admin/friend-link', data)
}

export const updateFriendLink = (id: number, data: FriendLinkDTO): Promise<void> => {
  return request.put(`/admin/friend-link/${id}`, data)
}

export const deleteFriendLink = (id: number): Promise<void> => {
  return request.delete(`/admin/friend-link/${id}`)
}

