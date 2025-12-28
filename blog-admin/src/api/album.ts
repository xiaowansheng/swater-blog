import request from './request'
import { Album, Picture, PageResult } from '@/types'

export interface AlbumDTO {
  name: string
  description?: string
  cover?: string
  status?: number
  sort?: number
}

export interface PictureDTO {
  albumId: number
  url: string
  description?: string
  sort?: number
}

// 相册接口
export const getAlbumList = (params?: {
  page?: number
  size?: number
}): Promise<PageResult<Album>> => {
  return request.get('/admin/album/list', { params })
}

export const getAlbumById = (id: number): Promise<Album> => {
  return request.get(`/admin/album/${id}`)
}

export const createAlbum = (data: AlbumDTO): Promise<number> => {
  return request.post('/admin/album', data)
}

export const updateAlbum = (id: number, data: AlbumDTO): Promise<void> => {
  return request.put(`/admin/album/${id}`, data)
}

export const deleteAlbum = (id: number): Promise<void> => {
  return request.delete(`/admin/album/${id}`)
}

// 图片接口
export const getPictureList = (params: {
  albumId: number
  page?: number
  size?: number
}): Promise<PageResult<Picture>> => {
  return request.get('/admin/picture/list', { params })
}

export const createPicture = (data: PictureDTO): Promise<number> => {
  return request.post('/admin/picture', data)
}

export const updatePicture = (id: number, data: PictureDTO): Promise<void> => {
  return request.put(`/admin/picture/${id}`, data)
}

export const deletePicture = (id: number): Promise<void> => {
  return request.delete(`/admin/picture/${id}`)
}

export const deleteBatchPicture = (ids: number[]): Promise<void> => {
  return request.delete('/admin/picture/batch', { data: ids })
}
