import request from './request'
import { Role } from '@/types'

export interface RoleDTO {
  name: string
  roleKey: string
  description?: string
}

export const getRoleList = (): Promise<Role[]> => {
  return request.get('/admin/role/list')
}

export const getRoleById = (id: number): Promise<Role> => {
  return request.get(`/admin/role/${id}`)
}

export const createRole = (data: RoleDTO): Promise<number> => {
  return request.post('/admin/role', data)
}

export const updateRole = (id: number, data: RoleDTO): Promise<void> => {
  return request.put(`/admin/role/${id}`, data)
}

export const deleteRole = (id: number): Promise<void> => {
  return request.delete(`/admin/role/${id}`)
}

export const assignMenus = (roleId: number, menuIds: number[]): Promise<void> => {
  return request.post(`/admin/role/${roleId}/menus`, menuIds)
}

export const assignApis = (roleId: number, apiIds: number[]): Promise<void> => {
  return request.post(`/admin/role/${roleId}/apis`, apiIds)
}
