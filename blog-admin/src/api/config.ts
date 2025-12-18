import request from './request'

export interface Config {
  key: string
  value: string
  groupName: string
}

export const getConfigList = (groupName?: string): Promise<Config[]> => {
  return request.get('/admin/config/list', { params: { groupName } })
}

export const updateConfig = (key: string, value: string): Promise<void> => {
  return request.put(`/admin/config/${key}`, { value })
}

export const batchUpdateConfig = (data: Record<string, any>): Promise<void> => {
  return request.put('/admin/config/batch', data)
}

