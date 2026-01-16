/**
 * 语雀API客户端
 */

import axios, { AxiosInstance } from 'axios'
import type {
  YuqueDoc,
  YuqueDocDetail,
  GetDocsOptions,
  CreateDocData,
  UpdateDocData,
} from '@/types/yuque'

export interface YuqueConfig {
  token: string
  baseUrl: string
  namespace: string // 格式: group/repo 或 book_id
}

export class YuqueClient {
  private client: AxiosInstance
  private config: YuqueConfig

  constructor(config: YuqueConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'X-Auth-Token': config.token,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })
  }

  /**
   * 获取文档列表
   */
  async getDocs(options: GetDocsOptions = {}): Promise<YuqueDoc[]> {
    try {
      const { bookId, groupLogin, bookSlug, page = 1, pageSize = 100 } = options

      let url = ''
      if (bookId) {
        url = `/repos/${bookId}/docs`
      } else if (groupLogin && bookSlug) {
        url = `/repos/${groupLogin}/${bookSlug}/docs`
      } else {
        // 使用namespace
        const [group, repo] = this.config.namespace.split('/')
        url = `/repos/${group}/${repo}/docs`
      }

      const response = await this.client.get(url, {
        params: {
          page,
          per_page: pageSize,
        },
      })

      return response.data.data || []
    } catch (error) {
      console.error('获取语雀文档列表失败:', error)
      throw new Error(`获取文档列表失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 获取文档详情
   */
  async getDoc(docId: string): Promise<YuqueDocDetail> {
    try {
      const response = await this.client.get(`/repos/docs/${docId}`)
      return response.data.data
    } catch (error) {
      console.error('获取语雀文档详情失败:', error)
      throw new Error(`获取文档详情失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 创建文档
   */
  async createDoc(
    bookId: string,
    data: CreateDocData
  ): Promise<YuqueDocDetail> {
    try {
      const response = await this.client.post(`/repos/${bookId}/docs`, {
        title: data.title,
        slug: data.slug,
        body: data.body,
        format: data.format || 'markdown',
        public: data.public ?? 0,
        description: data.description,
      })

      return response.data.data
    } catch (error) {
      console.error('创建语雀文档失败:', error)
      throw new Error(`创建文档失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 更新文档
   */
  async updateDoc(
    docId: string,
    data: UpdateDocData
  ): Promise<YuqueDocDetail> {
    try {
      const response = await this.client.put(`/repos/docs/${docId}`, {
        title: data.title,
        slug: data.slug,
        body: data.body,
        format: data.format || 'markdown',
        public: data.public ?? 0,
        description: data.description,
      })

      return response.data.data
    } catch (error) {
      console.error('更新语雀文档失败:', error)
      throw new Error(`更新文档失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 删除文档
   */
  async deleteDoc(docId: string): Promise<void> {
    try {
      await this.client.delete(`/repos/docs/${docId}`)
    } catch (error) {
      console.error('删除语雀文档失败:', error)
      throw new Error(`删除文档失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/hello')
      return response.status === 200
    } catch (error) {
      console.error('语雀连接测试失败:', error)
      return false
    }
  }

  /**
   * 获取知识库列表
   */
  async getRepos(): Promise<any[]> {
    try {
      const [group] = this.config.namespace.split('/')
      const response = await this.client.get(`/users/${group}/repos`)
      return response.data.data || []
    } catch (error) {
      console.error('获取知识库列表失败:', error)
      throw new Error(`获取知识库列表失败: ${this.getMessage(error)}`)
    }
  }

  /**
   * 提取错误信息
   */
  private getMessage(error: any): string {
    if (error.response) {
      const data = error.response.data
      return data?.message || data?.error || error.response.statusText
    }
    if (error.request) {
      return '网络请求失败，请检查网络连接'
    }
    return error.message || '未知错误'
  }
}

/**
 * 创建语雀客户端实例
 */
export async function createYuqueClient(): Promise<YuqueClient> {
  const { prisma } = await import('@/lib/db/prisma')

  const configs = await prisma.config.findMany({
    where: { category: 'yuque' },
  })

  const config = configs.reduce((acc, c) => {
    acc[c.key.split('.')[1]] = c.value
    return acc
  }, {} as Record<string, string>)

  if (!config.token || !config.namespace) {
    throw new Error('语雀配置不完整，请先配置Token和知识库路径')
  }

  return new YuqueClient({
    token: config.token,
    baseUrl: config.baseUrl || 'https://www.yuque.com/api/v2',
    namespace: config.namespace,
  })
}
