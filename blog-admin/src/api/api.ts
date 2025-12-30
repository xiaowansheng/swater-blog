import request from './request'
import { ApiVO, ApiDTO } from '@/types/api'

export const getApiList = (): Promise<ApiVO[]> => {
  return request.get('/admin/api/list')
}

export const getApiById = (id: number): Promise<ApiVO> => {
  return request.get(`/admin/api/${id}`)
}

export const createApi = (data: ApiDTO): Promise<number> => {
  return request.post('/admin/api', data)
}

export const updateApi = (id: number, data: ApiDTO): Promise<void> => {
  return request.put(`/admin/api/${id}`, data)
}

export const deleteApi = (id: number): Promise<void> => {
  return request.delete(`/admin/api/${id}`)
}
