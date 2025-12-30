export interface ApiVO {
  id: number
  apiKey: string
  name: string
  path: string
  method: string
  description: string
  parentId: number
  isOpen: number
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
  isOpen?: number
  perms?: string
  sort?: number
}
