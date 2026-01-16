/**
 * 字段映射器
 * 负责语雀文档与博客文章之间的字段映射
 */

import type { YuqueDocDetail } from '@/types/yuque'
import type { BlogArticle, CreateArticleData } from '@/types/blog'
import { ContentTransformer } from './transformer'

export interface MappingConfig {
  // 字段映射规则
  fieldMapping: {
    title: string
    content: string
    excerpt?: string
    slug?: string
    cover?: string
  }

  // 分类映射
  categoryMapping?: {
    type: 'book' | 'path' | 'pattern' | 'none'
    mapping?: Record<string, string>
    pattern?: string
  }

  // 标签处理
  tagProcessing: {
    enabled: boolean
    createIfNotExist: boolean
  }

  // 发布设置
  publishSettings: {
    autoPublish: boolean
    status?: 0 | 1 | 2 // 0:草稿, 1:已发布, 2:私密
  }
}

export class FieldMapper {
  private transformer: ContentTransformer
  private config: MappingConfig

  constructor(config: MappingConfig) {
    this.config = config
    this.transformer = new ContentTransformer()
  }

  /**
   * 语雀文档 → 博客文章数据
   */
  async yuqueToBlog(
    yuqueDoc: YuqueDocDetail,
    options: {
      categoryId?: number
      tags?: string[]
    } = {}
  ): Promise<CreateArticleData> {
    const {
      fieldMapping,
      publishSettings,
      categoryMapping,
    } = this.config

    // 提取标题
    const title = this.extractField(yuqueDoc, fieldMapping.title) || yuqueDoc.title

    // 提取内容
    const content = this.extractField(yuqueDoc, fieldMapping.content)
    const processedContent = await this.transformer.processContent(content, {
      format: yuqueDoc.format,
      downloadImages: false, // 暂不支持图片下载
    })

    // 提取摘要
    let excerpt: string | undefined
    if (fieldMapping.excerpt) {
      excerpt = this.extractField(yuqueDoc, fieldMapping.excerpt)
    }
    if (!excerpt) {
      excerpt = this.transformer.extractExcerpt(processedContent, 200)
    }

    // 生成slug
    let slug: string | undefined
    if (fieldMapping.slug) {
      slug = this.extractField(yuqueDoc, fieldMapping.slug)
    }
    if (!slug && yuqueDoc.slug) {
      slug = this.transformer.slugify(yuqueDoc.slug)
    }

    // 提取封面
    let cover: string | undefined
    if (fieldMapping.cover) {
      cover = this.extractField(yuqueDoc, fieldMapping.cover)
    }
    if (!cover && yuqueDoc.cover) {
      cover = yuqueDoc.cover
    }

    // 生成article_key
    const articleKey = this.generateArticleKey(title)

    // 确定状态
    const status = publishSettings.autoPublish
      ? (publishSettings.status ?? 1)
      : 0

    // 确定发布时间
    const publishedAt = status === 1 && yuqueDoc.published_at
      ? new Date(yuqueDoc.published_at)
      : undefined

    return {
      article_key: articleKey,
      title,
      slug,
      content: processedContent,
      excerpt,
      cover,
      category_id: options.categoryId,
      status,
      published_at,
    }
  }

  /**
   * 博客文章 → 语雀文档数据
   */
  async blogToYuque(
    article: BlogArticle
  ): Promise<{
    title: string
    body: string
    format: 'markdown' | 'html'
    slug?: string
    description?: string
  }> {
    // 标题直接使用
    const title = article.title

    // 内容需要转换
    const body = article.content

    // 格式默认markdown
    const format: 'markdown' | 'html' = 'markdown'

    // slug使用博客的slug
    const slug = article.slug || undefined

    // 描述使用摘要
    const description = article.excerpt || undefined

    return {
      title,
      body,
      format,
      slug,
      description,
    }
  }

  /**
   * 从语雀文档中提取字段值
   */
  private extractField(doc: YuqueDocDetail, fieldPath: string): string {
    const parts = fieldPath.split('.')
    let value: any = doc

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part]
      } else {
        return ''
      }
    }

    return typeof value === 'string' ? value : ''
  }

  /**
   * 生成article_key
   */
  private generateArticleKey(title: string): string {
    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const slug = this.transformer.slugify(title).substring(0, 50)
    return `${dateStr}-${slug}`
  }
}

/**
 * 创建默认字段映射器
 */
export async function createFieldMapper(): Promise<FieldMapper> {
  const { prisma } = await import('@/lib/db/prisma')

  // 获取同步配置
  const configs = await prisma.config.findMany({
    where: { category: 'sync' },
  })

  const configMap = configs.reduce((acc, c) => {
    acc[c.key.split('.')[1]] = c.value
    return acc
  }, {} as Record<string, string>)

  return new FieldMapper({
    fieldMapping: {
      title: 'title',
      content: 'body',
      excerpt: 'description',
      slug: 'slug',
      cover: 'cover',
    },
    tagProcessing: {
      enabled: true,
      createIfNotExist: true,
    },
    publishSettings: {
      autoPublish: configMap.autoPublish === 'true',
      status: 1,
    },
  })
}
