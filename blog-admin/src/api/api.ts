import request from './request'
import { ApiVO, ApiDTO, ApiRefreshResultVO } from '@/types/api'

export const getApiList = (): Promise<ApiVO[]> => {
  return request.get('/admin/api-resource/tree')
}

export const getApiById = (id: number): Promise<ApiVO> => {
  return request.get(`/admin/api-resource/${id}`)
}

export const createApi = (data: ApiDTO): Promise<number> => {
  return request.post('/admin/api-resource', data)
}

export const updateApi = (id: number, data: ApiDTO): Promise<void> => {
  return request.put(`/admin/api-resource/${id}`, data)
}

export const deleteApi = (id: number): Promise<void> => {
  return request.delete(`/admin/api-resource/${id}`)
}

export const refreshApi = (): Promise<ApiRefreshResultVO> => {
  return request.post('/admin/api-resource/refresh')
}
