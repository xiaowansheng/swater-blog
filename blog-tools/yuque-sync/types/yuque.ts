/**
 * 语雀相关类型定义
 */

// 语雀文档类型
export type YuqueDocType = 'Doc' | 'Sheet' | 'Thread' | 'Board' | 'Table'

// 语雀文档格式
export type YuqueDocFormat = 'markdown' | 'html' | 'lake'

// 语雀公开性
export type YuquePublic = 0 | 1 | 2 // 0:私密, 1:公开, 2:企业内公开

// 语雀文档基础信息
export interface YuqueDoc {
  id: number
  type: YuqueDocType
  slug: string
  title: string
  description?: string
  cover?: string
  user_id: number
  book_id: number
  last_editor_id?: number
  public?: YuquePublic
  status?: string
  likes_count?: number
  read_count?: number
  comments_count?: number
  word_count?: number
  created_at: string
  updated_at: string
  content_updated_at?: string
  published_at?: string
  first_published_at?: string
  book?: YuqueBook
  user?: YuqueUser
  last_editor?: YuqueUser
  tags?: YuqueTag[]
}

// 语雀文档详情
export interface YuqueDocDetail extends YuqueDoc {
  format: YuqueDocFormat
  body: string // 正文原始内容
  body_draft?: string // 草稿内容
  body_html?: string // HTML格式内容
  body_lake?: string // Lake格式内容
}

// 语雀知识库
export interface YuqueBook {
  id: number
  type: string
  slug: string
  name: string
  user_id: number
  description?: string
  creator_id?: number
  public: YuquePublic
  created_at: string
  updated_at: string
}

// 语雀用户
export interface YuqueUser {
  id: number
  type: string
  name: string
  login: string
  description?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// 语雀标签
export interface YuqueTag {
  id: number
  title: string
  created_at: string
  updated_at: string
}

// 获取文档列表参数
export interface GetDocsOptions {
  bookId?: string
  groupLogin?: string
  bookSlug?: string
  page?: number
  pageSize?: number
  includeDrafts?: boolean
}

// 创建文档参数
export interface CreateDocData {
  slug?: string
  title: string
  body: string
  format?: YuqueDocFormat
  public?: YuquePublic
  description?: string
}

// 更新文档参数
export interface UpdateDocData {
  slug?: string
  title?: string
  body?: string
  format?: YuqueDocFormat
  public?: YuquePublic
  description?: string
}

// 删除文档参数
export interface DeleteDocOptions {
  bookId: string
  docId: string
}
