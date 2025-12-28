import request from './request'
import { Visitor, PageResult, VisitorStatistics } from '@/types'

export const getVisitorList = (params: {
  page?: number
  size?: number
  keyword?: string
}): Promise<PageResult<Visitor>> => {
  return request.get('/admin/visitor/list', { params })
}

export const getVisitorStatistics = (params?: {
  startDate?: string
  endDate?: string
}): Promise<VisitorStatistics> => {
  return request.get('/admin/visitor/statistics', { params })
}
