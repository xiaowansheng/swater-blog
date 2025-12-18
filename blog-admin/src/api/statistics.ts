import request from './request'

export const getDashboardStatistics = (): Promise<any> => {
  return request.get('/admin/statistics/dashboard')
}

