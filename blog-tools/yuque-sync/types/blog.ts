/**
 * 博客相关类型定义
 */

// 博客文章状态
export type BlogArticleStatus = 0 | 1 | 2 // 0:草稿, 1:已发布, 2:私密

// 博客文章类型
export type BlogArticleType = 1 | 2 | 3 | 4 // 1:原创, 2:转载, 3:翻译, 4:引用

// 博客文章
export interface BlogArticle {
  id: number
  article_key: string
  title: string
  slug?: string
  content: string
  excerpt?: string
  cover?: string
  author_id?: number
  category_id?: number
  status: BlogArticleStatus
  type: BlogArticleType
  original_author?: string
  original_title?: string
  original_url?: string
  note?: string
  is_top: boolean
  view_count: number
  like_count: number
  comment_count: number
  version: number
  published_at?: Date
  created_at: Date
  updated_at: Date
  deleted: boolean
}

// 博客分类
export interface BlogCategory {
  id: number
  category_key: string
  name: string
  slug?: string
  description?: string
  parent_id: number
  sort: number
  status: string
  deleted: boolean
  created_at: Date
  updated_at: Date
}

// 博客标签
export interface BlogTag {
  id: number
  tag_key: string
  name: string
  slug?: string
  color?: string
  description?: string
  status: string
  deleted: boolean
  created_at: Date
  updated_at: Date
}

// 创建文章参数
export interface CreateArticleData {
  article_key: string
  title: string
  slug?: string
  content: string
  excerpt?: string
  cover?: string
  author_id?: number
  category_id?: number
  status?: BlogArticleStatus
  type?: BlogArticleType
  published_at?: Date
}

// 更新文章参数
export interface UpdateArticleData {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  cover?: string
  category_id?: number
  status?: BlogArticleStatus
  published_at?: Date
}

// 获取文章列表参数
export interface GetArticlesOptions {
  page?: number
  pageSize?: number
  status?: BlogArticleStatus
  categoryId?: number
  keyword?: string
}
