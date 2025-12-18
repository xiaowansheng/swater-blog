import request from './request'
import { Category } from '@/types'

export interface CategoryDTO {
  name: string
  description: string
}

export const getCategoryList = (): Promise<Category[]> => {
  return request.get('/admin/category/list')
}

export const createCategory = (data: CategoryDTO): Promise<number> => {
  return request.post('/admin/category', data)
}

export const updateCategory = (id: number, data: CategoryDTO): Promise<void> => {
  return request.put(`/admin/category/${id}`, data)
}

export const deleteCategory = (id: number): Promise<void> => {
  return request.delete(`/admin/category/${id}`)
}

