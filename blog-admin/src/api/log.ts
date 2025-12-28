import request from './request'
import { LogOperation, LogError, PageResult } from '@/types'

export const getOperationLogList = (params: {
  page?: number
  size?: number
  module?: string
  keyword?: string
}): Promise<PageResult<LogOperation>> => {
  return request.get('/admin/log/operation/list', { params })
}

export const getErrorLogList = (params: {
  page?: number
  size?: number
  keyword?: string
}): Promise<PageResult<LogError>> => {
  return request.get('/admin/log/error/list', { params })
}

export const getOperationLogById = (id: number): Promise<LogOperation> => {
  return request.get(`/admin/log/operation/${id}`)
}

export const getErrorLogById = (id: number): Promise<LogError> => {
  return request.get(`/admin/log/error/${id}`)
}

export const deleteOperationLog = (id: number): Promise<void> => {
  return request.delete(`/admin/log/operation/${id}`)
}

export const deleteErrorLog = (id: number): Promise<void> => {
  return request.delete(`/admin/log/error/${id}`)
}

export const clearOperationLogs = (): Promise<void> => {
  return request.delete('/admin/log/operation/clear')
}

export const clearErrorLogs = (): Promise<void> => {
  return request.delete('/admin/log/error/clear')
}
