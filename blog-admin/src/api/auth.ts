import request from './request'
import { User } from '@/types'

export interface LoginDTO {
  username: string
  password: string
}

export interface LoginVO {
  token: string
  user: User
}

export const login = (data: LoginDTO): Promise<LoginVO> => {
  return request.post('/auth/login', data)
}

export const logout = (): Promise<void> => {
  return request.post('/auth/logout')
}

export const getCurrentUser = (): Promise<User> => {
  return request.get('/auth/current')
}

export const refreshToken = (): Promise<string> => {
  return request.post('/auth/refresh')
}

