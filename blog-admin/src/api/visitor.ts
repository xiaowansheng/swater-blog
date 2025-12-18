import request from './request'
import { PageResult } from '@/types'

export interface Visitor {
  id: number
  ip: string
  location: string
  device: string
  browser: string
  visitTime: string
}

export const getVisitorList = (params: {
  page?: number
  size?: number
  keyword?: string
}): Promise<PageResult<Visitor>> => {
  return request.get('/admin/visitor/list', { params })
}

export const getVisitorStatistics = (params: {
  startDate?: string
  endDate?: string
}): Promise<any> => {
  return request.get('/admin/visitor/statistics', { params })
}

