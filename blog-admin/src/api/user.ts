import request from './request'
import { User, PageResult } from '@/types'

export interface UserDTO {
  username: string
  nickname: string
  email: string
  password?: string
  roleIds: number[]
}

export const getUserList = (params: {
  page?: number
  size?: number
  keyword?: string
}): Promise<PageResult<User>> => {
  return request.get('/admin/user/list', { params })
}

export const createUser = (data: UserDTO): Promise<number> => {
  return request.post('/admin/user', data)
}

export const updateUser = (id: number, data: UserDTO): Promise<void> => {
  return request.put(`/admin/user/${id}`, data)
}

export const deleteUser = (id: number): Promise<void> => {
  return request.delete(`/admin/user/${id}`)
}

export const resetPassword = (id: number, password: string): Promise<void> => {
  return request.post(`/admin/user/${id}/reset-password`, { password })
}

export const assignRoles = (id: number, roleIds: number[]): Promise<void> => {
  return request.post(`/admin/user/${id}/roles`, roleIds)
}

export interface UpdateProfileDTO {
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  qq?: string
  signature?: string
  website?: string
  introduction?: string
}

export const updateCurrentUser = (data: UpdateProfileDTO): Promise<void> => {
  return request.put('/admin/user/profile', data)
}

export const updatePassword = (data: { oldPassword: string; newPassword: string }): Promise<void> => {
  return request.post('/admin/user/password', data)
}

