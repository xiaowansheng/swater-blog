import request from './request'
import { ApiVO, ApiDTO } from '@/types/resource'

export const getApiList = (): Promise<ApiVO[]> => {
  return request.get('/admin/resource/list')
}

export const getApiById = (id: number): Promise<ApiVO> => {
  return request.get(`/admin/resource/${id}`)
}

export const createApi = (data: ApiDTO): Promise<number> => {
  return request.post('/admin/resource', data)
}

export const updateApi = (id: number, data: ApiDTO): Promise<void> => {
  return request.put(`/admin/resource/${id}`, data)
}

export const deleteApi = (id: number): Promise<void> => {
  return request.delete(`/admin/resource/${id}`)
}
