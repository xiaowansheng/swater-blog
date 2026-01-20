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
  keyword?: string
  id?: string
  articleKey?: string
  status?: number
  categoryId?: number
  type?: string
  isTop?: number
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

// ==================== Markdown 导入相关接口 ====================

// Markdown 导入配置
export interface MarkdownImportConfig {
  categoryMode?: 'AUTO' | 'MANUAL' | 'FRONTMATTER'
  manualCategoryId?: number
  autoCreateCategory?: boolean
  overwriteCategory?: boolean
  assetMode?: 'RELATIVE_PATH' | 'ABSOLUTE_URL' | 'BASE64'
  cdnDomain?: string
  basePath?: string
  base64Threshold?: number
  defaultStatus?: 'DRAFT' | 'PUBLISHED'
  preserveFrontmatter?: boolean
  authorId?: number
  importAssets?: boolean
  articleType?: string
}

// Markdown 导入预览
export interface MarkdownImportPreview {
  totalFileCount: number
  mdFileCount: number
  assetFileCount: number
  articleCount: number
  categoryCount: number
  fileStructure?: any
  categories: MarkdownImportCategoryPreview[]
  articles: MarkdownImportArticlePreview[]
  documents: any[]
  warnings: string[]
}

export interface MarkdownImportCategoryPreview {
  categoryKey: string
  name: string
  parentKey?: string
  level: number
  fullPath: string
  articleCount: number
  exists: boolean
  willCreate: boolean
}

export interface MarkdownImportArticlePreview {
  originalFilename: string
  filePath: string
  title: string
  slug: string
  category?: string
  categoryKey?: string
  tags: string[]
  excerpt?: string
  cover?: string
  hasFrontmatter: boolean
  isDraft: boolean
  assetCount: number
  assets: string[]
  contentLength: number
  imageCount: number
}

// Markdown 导入结果
export interface MarkdownImportResult {
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED'
  successCount: number
  failedCount: number
  skippedCount: number
  createdCategoryCount: number
  importedAssetCount: number
  articles: MarkdownImportedArticle[]
  categories: MarkdownImportCreatedCategory[]
  errors: MarkdownImportError[]
  duration: number
}

export interface MarkdownImportedArticle {
  originalFilename: string
  articleId: number
  title: string
  slug: string
  categoryId?: number
  categoryName?: string
  tags?: string[]
  status: string
  hasAssets: boolean
  assetCount: number
}

export interface MarkdownImportCreatedCategory {
  categoryId: number
  categoryKey: string
  name: string
  parentId?: number
  level: number
  articleCount: number
}

export interface MarkdownImportError {
  filename: string
  message: string
  errorType: 'PARSE_ERROR' | 'FILE_READ_ERROR' | 'CATEGORY_ERROR' | 'ARTICLE_CREATE_ERROR' | 'ASSET_UPLOAD_ERROR' | 'SKIPPED'
  stackTrace?: string
}

// 预览 Markdown 导入
export const previewMarkdownImport = (files: File[], basePath?: string): Promise<MarkdownImportPreview> => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  if (basePath) {
    formData.append('basePath', basePath)
  }
  return request.post('/admin/post/import-md/preview', formData)
}

// 导入单个 Markdown 文件
export const importMarkdown = (file: File, config?: Partial<MarkdownImportConfig>): Promise<MarkdownImportResult> => {
  const formData = new FormData()
  formData.append('file', file)

  if (config) {
    if (config.manualCategoryId !== undefined) formData.append('categoryId', config.manualCategoryId.toString())
    if (config.importAssets !== undefined) formData.append('importAssets', config.importAssets.toString())
    if (config.assetMode) formData.append('assetMode', config.assetMode)
    if (config.defaultStatus) formData.append('defaultStatus', config.defaultStatus)
  }

  return request.post('/admin/post/import-md', formData)
}

// 批量导入 Markdown 文件
export const importMarkdownBatch = (files: File[], config?: MarkdownImportConfig): Promise<MarkdownImportResult> => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  if (config) {
    formData.append('configJson', JSON.stringify(config))
  }

  return request.post('/admin/post/import-md/batch', formData)
}
