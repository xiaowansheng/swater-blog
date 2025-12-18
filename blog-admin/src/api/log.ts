import request from './request'
import { PageResult } from '@/types'

export interface OperationLog {
  id: number
  userId: number
  operation: string
  method: string
  params: string
  ip: string
  location: string
  duration: number
  createTime: string
}

export interface ErrorLog {
  id: number
  userId: number
  method: string
  url: string
  error: string
  stack: string
  ip: string
  createTime: string
}

export const getOperationLogList = (params: {
  page?: number
  size?: number
  userId?: number
  startDate?: string
  endDate?: string
}): Promise<PageResult<OperationLog>> => {
  return request.get('/admin/log/operation/list', { params })
}

export const getErrorLogList = (params: {
  page?: number
  size?: number
  userId?: number
  startDate?: string
  endDate?: string
}): Promise<PageResult<ErrorLog>> => {
  return request.get('/admin/log/exception/list', { params })
}

export const deleteLog = (type: string, id: number): Promise<void> => {
  return request.delete(`/admin/log/${type}/${id}`)
}

export const cleanupLogs = (): Promise<void> => {
  return request.post('/admin/log/cleanup')
}

