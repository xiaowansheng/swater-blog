import request from './request'
import { Comment, PageResult } from '@/types'

export const getCommentList = (params: {
  page?: number
  size?: number
  status?: number
  postId?: number
  momentId?: number
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

