import request from './request'
import { FriendLink } from '@/types'
import { FriendLinkReviewStatus, FriendLinkVisibilityStatus } from '@/types/enums'

export interface FriendLinkDTO {
  name: string
  url: string
  logo: string
  description: string
  author: string
  sort?: number
  reviewStatus?: FriendLinkReviewStatus
  isVisible?: FriendLinkVisibilityStatus
}

export const getFriendLinkList = (params?: {
  id?: number
  userId?: number
  name?: string
  author?: string
  email?: string
  url?: string
  reviewStatus?: FriendLinkReviewStatus
  isVisible?: FriendLinkVisibilityStatus
}): Promise<FriendLink[]> => {
  return request.get('/admin/friend-link/list', { params })
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

export const approveFriendLink = (id: number): Promise<void> => {
  return request.post(`/admin/friend-link/${id}/approve`)
}

export const rejectFriendLink = (id: number): Promise<void> => {
  return request.post(`/admin/friend-link/${id}/reject`)
}

