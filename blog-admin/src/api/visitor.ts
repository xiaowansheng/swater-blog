import request from './request'
import { Visitor, PageResult, VisitorStatistics, VisitorPageTrace, VisitorTrackingDetail } from '@/types'

export const getVisitorList = (params: {
  page?: number
  size?: number
  ip?: string
  country?: string
  province?: string
  city?: string
  deviceType?: string
  osName?: string
  browserName?: string
  trafficSource?: string
}): Promise<PageResult<Visitor>> => {
  return request.get('/admin/visitor/list', { params })
}

export const getVisitorStatistics = (params?: {
  startDate?: string
  endDate?: string
}): Promise<VisitorStatistics> => {
  return request.get('/admin/visitor/statistics', { params })
}

export const getVisitorTrackingDetail = (visitorId: number, params?: {
  limit?: number
}): Promise<VisitorTrackingDetail> => {
  return request.get(`/admin/visitor/tracking/${visitorId}`, { params })
}

export const getVisitorSessionPages = (visitorId: number, sessionId: string): Promise<VisitorPageTrace[]> => {
  return request.get(`/admin/visitor/tracking/${visitorId}/sessions/${sessionId}/pages`)
}
