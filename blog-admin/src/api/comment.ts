import request from './request'
import { Comment, PageResult } from '@/types'
import { CommentStatus, CommentVisibilityStatus } from '@/types/enums'

export const getCommentList = (params: {
  page?: number
  size?: number
  status?: CommentStatus
  targetId?: number
  id?: number
  parentId?: number
  rootId?: number
  targetType?: string
  isVisible?: CommentVisibilityStatus
  keyword?: string
  country?: string
  province?: string
  city?: string
  location?: string
}): Promise<PageResult<Comment>> => {
  return request.get('/admin/comment/list', { params })
}

export const approveComment = (id: number): Promise<void> => {
  return request.post(`/admin/comment/${id}/approve`)
}

export const rejectComment = (id: number): Promise<void> => {
  return request.post(`/admin/comment/${id}/reject`)
}

export const deleteComment = (id: number): Promise<void> => {
  return request.delete(`/admin/comment/${id}`)
}

export const setVisibleComment = (id: number): Promise<void> => {
  return request.post(`/admin/comment/${id}/visible`)
}

export const setHiddenComment = (id: number): Promise<void> => {
  return request.post(`/admin/comment/${id}/hidden`)
}

