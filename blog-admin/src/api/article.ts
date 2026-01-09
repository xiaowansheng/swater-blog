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

// 文章保存DTO
export interface ArticleSaveDTO {
  id?: number
  title: string
  slug?: string
  content: string
  excerpt?: string
  cover?: string
  categoryId?: number
  categoryName?: string
  type?: string
  originalAuthor?: string
  originalTitle?: string
  originalUrl?: string
  note?: string
  status?: number
  isTop?: number
  tagIds?: number[]
  tagNames?: string[]
  articleKey?: string
  autoSave?: boolean
  clientVersion?: number
}

// 文章保存结果
export interface ArticleSaveResult {
  id: number
  articleKey: string
  updateTime: string
  version: number
  isNew: boolean
  autoSave: boolean
  status: number
  hasConflict: boolean
  conflictMessage?: string
  serverContent?: string
  serverUpdateTime?: string
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

// 保存文章（支持自动保存和手动保存）
export const saveArticle = (data: ArticleSaveDTO): Promise<ArticleSaveResult> => {
  return request.post('/admin/post/save', data)
}

// 获取文章当前版本号
export const getArticleVersion = (id: number): Promise<number> => {
  return request.get(`/admin/post/${id}/version`)
}

// 检查文章是否存在版本冲突
export const checkArticleConflict = (id: number, clientVersion: number): Promise<boolean> => {
  return request.get(`/admin/post/${id}/conflict`, { params: { clientVersion } })
}
