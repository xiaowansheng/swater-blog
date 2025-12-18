import request from './request'
import { PageResult } from '@/types'

export interface File {
  id: number
  name: string
  url: string
  size: number
  type: string
  createTime: string
}

export const uploadFile = (file: File): Promise<File> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getFileList = (params: {
  page?: number
  size?: number
  type?: string
}): Promise<PageResult<File>> => {
  return request.get('/admin/file/list', { params })
}

export const deleteFile = (id: number): Promise<void> => {
  return request.delete(`/admin/file/${id}`)
}

