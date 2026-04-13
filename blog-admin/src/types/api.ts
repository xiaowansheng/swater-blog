import { ApiOpenStatus } from './enums'

export interface ApiVO {
  id: number
  apiKey: string
  name: string
  path: string
  method: string
  description: string
  parentId: number
  isOpen: ApiOpenStatus
  perms: string
  sort: number
  children?: ApiVO[]
  createTime?: string
  updateTime?: string
}

export interface ApiDTO {
  apiKey?: string
  name: string
  path?: string
  method?: string
  description?: string
  parentId?: number
  isOpen?: ApiOpenStatus
  perms?: string
  sort?: number
}

export interface ApiRefreshResultVO {
  createdModules: number
  updatedModules: number
  createdApis: number
  updatedApis: number
  total: number
  executionTime: number
  message: string
}
