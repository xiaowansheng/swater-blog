import request from './request'

export type ArticleDirectoryItemType = 'NODE' | 'ARTICLE'
export type ArticleDirectoryMovePosition = 'INSIDE' | 'BEFORE' | 'AFTER'
export type ArticleDirectoryTargetType = 'ROOT' | ArticleDirectoryItemType

export interface ArticleDirectoryItem {
  key: string
  type: ArticleDirectoryItemType
  id: number
  parentId: number
  sort?: number
  name?: string
  title?: string
  description?: string
  articleId?: number
  articleKey?: string
  slug?: string
  cover?: string
  status?: number
  categoryId?: number
  categoryName?: string
  createTime?: string
  updateTime?: string
  children?: ArticleDirectoryItem[]
}

export interface ArticleDirectoryNodeDTO {
  name: string
  description?: string
  parentId?: number
  sort?: number
}

export interface ArticleDirectoryMoveDTO {
  itemType: ArticleDirectoryItemType
  itemId: number
  targetType: ArticleDirectoryTargetType
  targetId?: number
  position: ArticleDirectoryMovePosition
}

export const getArticleDirectoryTree = (): Promise<ArticleDirectoryItem[]> => {
  return request.get('/admin/article-directory/tree')
}

export const createArticleDirectoryNode = (data: ArticleDirectoryNodeDTO): Promise<number> => {
  return request.post('/admin/article-directory/nodes', data)
}

export const updateArticleDirectoryNode = (id: number, data: ArticleDirectoryNodeDTO): Promise<void> => {
  return request.put(`/admin/article-directory/nodes/${id}`, data)
}

export const deleteArticleDirectoryNode = (id: number): Promise<void> => {
  return request.delete(`/admin/article-directory/nodes/${id}`)
}

export const moveArticleDirectoryItem = (data: ArticleDirectoryMoveDTO): Promise<void> => {
  return request.put('/admin/article-directory/items/move', data)
}

export const assignArticleToDirectory = (data: { articleId: number; parentId?: number }): Promise<void> => {
  return request.post('/admin/article-directory/articles/assign', data)
}

export const createDirectoryArticle = (data: { title: string; parentId?: number }): Promise<number> => {
  return request.post('/admin/article-directory/articles/create', data)
}
