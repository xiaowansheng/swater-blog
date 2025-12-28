import request from './request'
import { Menu } from '@/types'

export interface MenuDTO {
  name: string
  path: string
  component?: string
  icon?: string
  parentId?: number
  sort?: number
  visible?: number
  status?: number
}

export const getMenuList = (): Promise<Menu[]> => {
  return request.get('/admin/menu/list')
}

export const getMenuById = (id: number): Promise<Menu> => {
  return request.get(`/admin/menu/${id}`)
}

export const createMenu = (data: MenuDTO): Promise<number> => {
  return request.post('/admin/menu', data)
}

export const updateMenu = (id: number, data: MenuDTO): Promise<void> => {
  return request.put(`/admin/menu/${id}`, data)
}

export const deleteMenu = (id: number): Promise<void> => {
  return request.delete(`/admin/menu/${id}`)
}

export const getMenuTree = (): Promise<Menu[]> => {
  return request.get('/admin/menu/tree')
}
