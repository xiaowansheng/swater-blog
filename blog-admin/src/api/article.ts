import request from './request'
import { Article, PageResult, ArticleStatistics } from '@/types'

export interface ArticleDTO {
  title: string
  content: string
  excerpt?: string
  cover?: string
  categoryId: number
  tagIds?: number[]
  isTop?: number
  status?: number
  type?: string
  originalAuthor?: string
  originalTitle?: string
  originalUrl?: string
  note?: string
}

export const getArticleList = (params: {
  page?: number
  size?: number
  status?: number
  categoryId?: number
  keyword?: string
}): Promise<PageResult<Article>> => {
  return request.get('/admin/post/list', { params })
}

export const getArticleById = (id: number): Promise<Article> => {
  return request.get(`/admin/post/${id}`)
}

export const createArticle = (data: ArticleDTO): Promise<number> => {
  return request.post('/admin/post', data)
}

export const updateArticle = (id: number, data: ArticleDTO): Promise<void> => {
  return request.put(`/admin/post/${id}`, data)
}

export const deleteArticle = (id: number): Promise<void> => {
  return request.delete(`/admin/post/${id}`)
}

export const deleteBatchArticle = (ids: number[]): Promise<void> => {
  return request.delete('/admin/post/batch', { data: ids })
}

export const publishArticle = (id: number): Promise<void> => {
  return request.post(`/admin/post/${id}/publish`)
}

export const unpublishArticle = (id: number): Promise<void> => {
  return request.post(`/admin/post/${id}/unpublish`)
}

export const getArticleStatistics = (): Promise<ArticleStatistics> => {
  return request.get('/admin/post/statistics')
}
