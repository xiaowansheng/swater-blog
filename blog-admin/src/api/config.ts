import request from './request'
import { SysConfig } from '@/types'

export const getConfigList = (): Promise<SysConfig[]> => {
  return request.get('/admin/config/list')
}

export const getConfigByKey = (key: string): Promise<SysConfig> => {
  return request.get(`/admin/config/${key}`)
}

export const updateConfig = (key: string, value: string): Promise<void> => {
  return request.put(`/admin/config/${key}`, { value })
}

export const getConfigByType = (type: string): Promise<SysConfig[]> => {
  return request.get('/admin/config/type', { params: { type } })
}
