import request from './request'
import { MenuItem } from '@/types'

export interface MenuDTO {
  name: string
  path: string
  icon?: string
  parentId?: number
}

export const getMenuList = (): Promise<MenuItem[]> => {
  return request.get('/admin/menu/list')
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

export const assignMenus = (roleId: number, menuIds: number[]): Promise<void> => {
  return request.post(`/admin/menu/role/${roleId}/menus`, menuIds)
}

