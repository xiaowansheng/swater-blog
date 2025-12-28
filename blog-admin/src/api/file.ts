import request from './request'
import { FileMeta, PageResult } from '@/types'

export const getFileList = (params: {
  page?: number
  size?: number
  keyword?: string
  fileType?: string
}): Promise<PageResult<FileMeta>> => {
  return request.get('/admin/file/list', { params })
}

export const getFileById = (id: number): Promise<FileMeta> => {
  return request.get(`/admin/file/${id}`)
}

export const uploadFile = (file: File, category?: string): Promise<FileMeta> => {
  const formData = new FormData()
  formData.append('file', file)
  if (category) {
    formData.append('category', category)
  }
  return request.post('/admin/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteFile = (id: number): Promise<void> => {
  return request.delete(`/admin/file/${id}`)
}

export const deleteBatchFile = (ids: number[]): Promise<void> => {
  return request.delete('/admin/file/batch', { data: ids })
}
