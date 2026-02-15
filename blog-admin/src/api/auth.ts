import request from './request'
import { User } from '@/types'

export interface LoginDTO {
  username: string
  password?: string
  encryptedPassword?: string
  nonce?: string
  rememberMe?: boolean
}

export interface EmailLoginDTO {
  email: string
  code: string
  rememberMe?: boolean
}

export interface SendCodeDTO {
  email: string
  type: 'login' | 'reset'
}

export interface ResetPasswordDTO {
  email: string
  code: string
  newPassword: string
}

export interface LoginVO {
  token: string
  user: User
}

export interface LoginNonceVO {
  publicKey: string
  nonce: string
  expiresIn: number
}

export const login = (data: LoginDTO): Promise<LoginVO> => {
  return request.post('/auth/login', data)
}

export const getLoginNonce = (): Promise<LoginNonceVO> => {
  return request.get('/auth/login/nonce')
}

export const loginWithEmail = (data: EmailLoginDTO): Promise<LoginVO> => {
  return request.post('/auth/login/email', data)
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

export const sendEmailCode = (data: SendCodeDTO): Promise<void> => {
  return request.post('/auth/send-code', data)
}

export const resetPassword = (data: ResetPasswordDTO): Promise<void> => {
  return request.post('/auth/reset-password', data)
}

