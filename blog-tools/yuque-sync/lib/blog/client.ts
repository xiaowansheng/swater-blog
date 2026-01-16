/**
 * 博客数据库客户端
 */

import { createPool, Pool } from 'mysql2/promise'
import type {
  BlogArticle,
  BlogCategory,
  BlogTag,
  CreateArticleData,
  UpdateArticleData,
  GetArticlesOptions,
} from '@/types/blog'

export interface BlogConfig {
  type: 'mysql' | 'postgresql'
  host: string
  port: number
  database: string
  username: string
  password: string
}

export class BlogClient {
  private pool: Pool
  private config: BlogConfig

  constructor(config: BlogConfig) {
    this.config = config
    this.pool = createPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection()
      await connection.ping()
      connection.release()
      return true
    } catch (error) {
      console.error('博客数据库连接测试失败:', error)
      return false
    }
  }

  /**
   * 获取文章列表
   */
  async getArticles(options: GetArticlesOptions = {}): Promise<BlogArticle[]> {
    const {
      page = 1,
      pageSize = 20,
      status,
      categoryId,
      keyword,
    } = options

    const conditions = ['deleted = 0']
    const params: any[] = []

    if (status !== undefined) {
      conditions.push('status = ?')
      params.push(status)
    }

    if (categoryId) {
      conditions.push('category_id = ?')
      params.push(categoryId)
    }

    if (keyword) {
      conditions.push('(title LIKE ? OR content LIKE ?)')
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    const offset = (page - 1) * pageSize
    const sql = `
      SELECT
        id, article_key, title, slug, content, excerpt, cover,
        author_id, category_id, status, type,
        original_author, original_title, original_url, note,
        is_top, view_count, like_count, comment_count, version,
        published_at, created_at, updated_at, deleted
      FROM article
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `

    try {
      const [rows] = await this.pool.query(sql, [...params, pageSize, offset])
      return (rows as any[]).map(this.mapArticle)
    } catch (error) {
      console.error('获取博客文章列表失败:', error)
      throw new Error(`获取文章列表失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 根据ID获取文章
   */
  async getArticleById(id: number): Promise<BlogArticle | null> {
    const sql = `
      SELECT
        id, article_key, title, slug, content, excerpt, cover,
        author_id, category_id, status, type,
        original_author, original_title, original_url, note,
        is_top, view_count, like_count, comment_count, version,
        published_at, created_at, updated_at, deleted
      FROM article
      WHERE id = ? AND deleted = 0
    `

    try {
      const [rows] = await this.pool.query(sql, [id])
      const articles = (rows as any[]).map(this.mapArticle)
      return articles[0] || null
    } catch (error) {
      console.error('获取博客文章失败:', error)
      throw new Error(`获取文章失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 根据slug获取文章
   */
  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    const sql = `
      SELECT
        id, article_key, title, slug, content, excerpt, cover,
        author_id, category_id, status, type,
        original_author, original_title, original_url, note,
        is_top, view_count, like_count, comment_count, version,
        published_at, created_at, updated_at, deleted
      FROM article
      WHERE slug = ? AND deleted = 0
    `

    try {
      const [rows] = await this.pool.query(sql, [slug])
      const articles = (rows as any[]).map(this.mapArticle)
      return articles[0] || null
    } catch (error) {
      console.error('获取博客文章失败:', error)
      throw new Error(`获取文章失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 创建文章
   */
  async createArticle(data: CreateArticleData): Promise<BlogArticle> {
    const sql = `
      INSERT INTO article (
        article_key, title, slug, content, excerpt, cover,
        author_id, category_id, status, type, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      data.article_key,
      data.title,
      data.slug || null,
      data.content,
      data.excerpt || null,
      data.cover || null,
      data.author_id || null,
      data.category_id || null,
      data.status ?? 0,
      data.type ?? 1,
      data.published_at || null,
    ]

    try {
      const [result] = await this.pool.query(sql, values)
      const insertId = (result as any).insertId
      const newArticle = await this.getArticleById(insertId)
      if (!newArticle) {
        throw new Error('创建文章后无法获取')
      }
      return newArticle
    } catch (error) {
      console.error('创建博客文章失败:', error)
      throw new Error(`创建文章失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 更新文章
   */
  async updateArticle(id: number, data: UpdateArticleData): Promise<BlogArticle> {
    const updates: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?')
      values.push(data.slug)
    }
    if (data.content !== undefined) {
      updates.push('content = ?')
      values.push(data.content)
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?')
      values.push(data.excerpt)
    }
    if (data.cover !== undefined) {
      updates.push('cover = ?')
      values.push(data.cover)
    }
    if (data.category_id !== undefined) {
      updates.push('category_id = ?')
      values.push(data.category_id)
    }
    if (data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }
    if (data.published_at !== undefined) {
      updates.push('published_at = ?')
      values.push(data.published_at)
    }

    if (updates.length === 0) {
      const article = await this.getArticleById(id)
      if (!article) throw new Error('文章不存在')
      return article
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const sql = `
      UPDATE article
      SET ${updates.join(', ')}
      WHERE id = ?
    `

    try {
      await this.pool.query(sql, values)
      const updatedArticle = await this.getArticleById(id)
      if (!updatedArticle) {
        throw new Error('更新文章后无法获取')
      }
      return updatedArticle
    } catch (error) {
      console.error('更新博客文章失败:', error)
      throw new Error(`更新文章失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 获取或创建分类
   */
  async getOrCreateCategory(name: string): Promise<BlogCategory> {
    // 先尝试查找
    const findSql = `SELECT * FROM category WHERE name = ? AND deleted = 0`
    try {
      const [rows] = await this.pool.query(findSql, [name])
      const categories = (rows as any[]).map(this.mapCategory)
      if (categories[0]) {
        return categories[0]
      }
    } catch (error) {
      console.error('查找分类失败:', error)
    }

    // 不存在则创建
    const categoryKey = name.toLowerCase().replace(/\s+/g, '-')
    const slug = categoryKey

    const createSql = `
      INSERT INTO category (category_key, name, slug, description, parent_id, sort, status)
      VALUES (?, ?, ?, '', 0, 0, 'published')
    `

    try {
      const [result] = await this.pool.query(createSql, [categoryKey, name, slug])
      const insertId = (result as any).insertId

      const [newRows] = await this.pool.query('SELECT * FROM category WHERE id = ?', [insertId])
      const categories = (newRows as any[]).map(this.mapCategory)
      return categories[0]
    } catch (error) {
      console.error('创建分类失败:', error)
      throw new Error(`创建分类失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 获取或创建标签
   */
  async getOrCreateTag(name: string): Promise<BlogTag> {
    // 先尝试查找
    const findSql = `SELECT * FROM tag WHERE name = ? AND deleted = 0`
    try {
      const [rows] = await this.pool.query(findSql, [name])
      const tags = (rows as any[]).map(this.mapTag)
      if (tags[0]) {
        return tags[0]
      }
    } catch (error) {
      console.error('查找标签失败:', error)
    }

    // 不存在则创建
    const tagKey = name.toLowerCase().replace(/\s+/g, '-')
    const slug = tagKey

    const createSql = `
      INSERT INTO tag (tag_key, name, slug, color, description, status)
      VALUES (?, ?, ?, '', '', 'published')
    `

    try {
      const [result] = await this.pool.query(createSql, [tagKey, name, slug])
      const insertId = (result as any).insertId

      const [newRows] = await this.pool.query('SELECT * FROM tag WHERE id = ?', [insertId])
      const tags = (newRows as any[]).map(this.mapTag)
      return tags[0]
    } catch (error) {
      console.error('创建标签失败:', error)
      throw new Error(`创建标签失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 关联文章标签
   */
  async attachArticleTags(articleId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) return

    const sql = `
      INSERT IGNORE INTO article_tag (article_id, tag_id)
      VALUES ${tagIds.map(() => '(?, ?)').join(', ')}
    `

    const values = tagIds.flatMap(tagId => [articleId, tagId])

    try {
      await this.pool.query(sql, values)
    } catch (error) {
      console.error('关联文章标签失败:', error)
      throw new Error(`关联标签失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 获取文章的所有标签
   */
  async getArticleTags(articleId: number): Promise<BlogTag[]> {
    const sql = `
      SELECT t.* FROM tag t
      INNER JOIN article_tag at ON t.id = at.tag_id
      WHERE at.article_id = ? AND t.deleted = 0
    `

    try {
      const [rows] = await this.pool.query(sql, [articleId])
      return (rows as any[]).map(this.mapTag)
    } catch (error) {
      console.error('获取文章标签失败:', error)
      return []
    }
  }

  /**
   * 映射数据库行到文章对象
   */
  private mapArticle(row: any): BlogArticle {
    return {
      id: row.id,
      article_key: row.article_key,
      title: row.title,
      slug: row.slug,
      content: row.content,
      excerpt: row.excerpt,
      cover: row.cover,
      author_id: row.author_id,
      category_id: row.category_id,
      status: row.status,
      type: row.type,
      original_author: row.original_author,
      original_title: row.original_title,
      original_url: row.original_url,
      note: row.note,
      is_top: !!row.is_top,
      view_count: row.view_count,
      like_count: row.like_count,
      comment_count: row.comment_count,
      version: row.version,
      published_at: row.published_at ? new Date(row.published_at) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      deleted: !!row.deleted,
    }
  }

  /**
   * 映射数据库行到分类对象
   */
  private mapCategory(row: any): BlogCategory {
    return {
      id: row.id,
      category_key: row.category_key,
      name: row.name,
      slug: row.slug,
      description: row.description,
      parent_id: row.parent_id,
      sort: row.sort,
      status: row.status,
      deleted: !!row.deleted,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }
  }

  /**
   * 映射数据库行到标签对象
   */
  private mapTag(row: any): BlogTag {
    return {
      id: row.id,
      tag_key: row.tag_key,
      name: row.name,
      slug: row.slug,
      color: row.color,
      description: row.description,
      status: row.status,
      deleted: !!row.deleted,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }
  }

  /**
   * 提取错误信息
   */
  private getMessage(error: any): string {
    if (error instanceof Error) {
      return error.message
    }
    if (error?.sqlMessage) {
      return error.sqlMessage
    }
    return '未知错误'
  }

  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    await this.pool.end()
  }
}

/**
 * 创建博客客户端实例
 */
export async function createBlogClient(): Promise<BlogClient> {
  const { prisma } = await import('@/lib/db/prisma')

  const configs = await prisma.config.findMany({
    where: { category: 'blog' },
  })

  const config = configs.reduce((acc, c) => {
    acc[c.key.split('.')[1]] = c.value
    return acc
  }, {} as Record<string, string>)

  if (!config.host || !config.database) {
    throw new Error('博客配置不完整，请先配置数据库连接信息')
  }

  return new BlogClient({
    type: (config.type as any) || 'mysql',
    host: config.host,
    port: parseInt(config.port || '3306'),
    database: config.database,
    username: config.username || 'root',
    password: config.password || '',
  })
}
