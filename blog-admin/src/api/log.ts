import request from './request'
import { LogOperation, LogError, PageResult } from '@/types'
import { OperationResultStatus } from '@/types/enums'

export const getOperationLogList = (params: {
  page?: number
  size?: number
  userId?: number
  module?: string
  type?: string
  keyword?: string
  requestMethod?: string
  requestUri?: string
  username?: string
  ip?: string
  status?: OperationResultStatus
  device?: string
  browser?: string
  ipSource?: string
  startDate?: string
  endDate?: string
}): Promise<PageResult<LogOperation>> => {
  return request.get('/admin/log/operation/list', { params })
}

export const getErrorLogList = (params: {
  page?: number
  size?: number
  userId?: number
  module?: string
  keyword?: string
  requestMethod?: string
  requestUri?: string
  username?: string
  ip?: string
  errorName?: string
  exceptionType?: string
  device?: string
  browser?: string
  ipSource?: string
  startDate?: string
  endDate?: string
}): Promise<PageResult<LogError>> => {
  return request.get('/admin/log/exception/list', { params })
}

export const getOperationLogById = (id: number): Promise<LogOperation> => {
  return request.get(`/admin/log/operation/${id}`)
}

export const getErrorLogById = (id: number): Promise<LogError> => {
  return request.get(`/admin/log/exception/${id}`)
}

export const deleteOperationLog = (id: number): Promise<void> => {
  return request.delete(`/admin/log/operation/${id}`)
}

export const deleteErrorLog = (id: number): Promise<void> => {
  return request.delete(`/admin/log/exception/${id}`)
}

export const clearOperationLogs = (): Promise<void> => {
  return request.delete('/admin/log/operation/clear')
}

export const clearErrorLogs = (): Promise<void> => {
  return request.delete('/admin/log/exception/clear')
}
