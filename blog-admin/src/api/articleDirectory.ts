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

export interface DirectoryNodeDTO {
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

export const createDirectoryNode = (data: DirectoryNodeDTO): Promise<number> => {
  return request.post('/admin/article-directory/nodes', data)
}

export const updateDirectoryNode = (id: number, data: DirectoryNodeDTO): Promise<void> => {
  return request.put(`/admin/article-directory/nodes/${id}`, data)
}

export const deleteDirectoryNode = (id: number): Promise<void> => {
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
