/**
 * 同步引擎
 * 负责导入、导出和双向同步的核心逻辑
 */

import { prisma } from '@/lib/db/prisma'
import type { YuqueDocDetail } from '@/types/yuque'
import type { BlogArticle } from '@/types/blog'
import { createYuqueClient } from '@/lib/yuque/client'
import { createBlogClient } from '@/lib/blog/client'
import { createFieldMapper, FieldMapper } from './mapper'

export interface SyncJobOptions {
  type: 'import' | 'export' | 'sync'
  direction: 'yuque_to_blog' | 'blog_to_yuque' | 'bidirectional'
  docIds?: string[]
  articleIds?: number[]
  options?: {
    publish?: boolean
    force?: boolean
    categoryId?: number
  }
}

export interface SyncJobResult {
  totalItems: number
  processedItems: number
  successItems: number
  failedItems: number
  skippedItems: number
  errors: Array<{
    item: string
    error: string
  }>
}

export class SyncEngine {
  /**
   * 创建同步任务
   */
  async createJob(options: SyncJobOptions): Promise<string> {
    const job = await prisma.syncJob.create({
      data: {
        jobType: options.type,
        syncDirection: options.direction,
        status: 'pending',
        totalItems: 0,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        skippedItems: 0,
        config: JSON.stringify(options),
      },
    })

    return job.id
  }

  /**
   * 执行同步任务
   */
  async executeJob(jobId: string): Promise<SyncJobResult> {
    const job = await prisma.syncJob.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      throw new Error('任务不存在')
    }

    // 更新状态为运行中
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'running',
        startTime: new Date(),
      },
    })

    try {
      const options = JSON.parse(job.config || '{}') as SyncJobOptions
      let result: SyncJobResult

      if (options.type === 'import') {
        result = await this.executeImport(jobId, options)
      } else if (options.type === 'export') {
        result = await this.executeExport(jobId, options)
      } else if (options.type === 'sync') {
        result = await this.executeSync(jobId, options)
      } else {
        throw new Error('未知任务类型')
      }

      // 更新任务状态
      await prisma.syncJob.update({
        where: { id: jobId },
        data: {
          status: result.failedItems > 0 ? 'failed' : 'completed',
          endTime: new Date(),
          duration: Date.now() - new Date(job.startTime || Date.now()).getTime(),
          processedItems: result.processedItems,
          successItems: result.successItems,
          failedItems: result.failedItems,
          skippedItems: result.skippedItems,
          errorMessage: result.errors.length > 0 ? result.errors[0].error : null,
        },
      })

      return result
    } catch (error) {
      // 更新任务为失败状态
      await prisma.syncJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          endTime: new Date(),
          errorMessage: error instanceof Error ? error.message : '未知错误',
        },
      })

      throw error
    }
  }

  /**
   * 执行导入（语雀 → 博客）
   */
  private async executeImport(
    jobId: string,
    options: SyncJobOptions
  ): Promise<SyncJobResult> {
    const yuqueClient = await createYuqueClient()
    const blogClient = await createBlogClient()
    const mapper = await createFieldMapper()

    const result: SyncJobResult = {
      totalItems: 0,
      processedItems: 0,
      successItems: 0,
      failedItems: 0,
      skippedItems: 0,
      errors: [],
    }

    try {
      // 获取要导入的文档
      const docsToImport: YuqueDocDetail[] = []

      if (options.docIds && options.docIds.length > 0) {
        // 导入指定文档
        for (const docId of options.docIds) {
          const doc = await yuqueClient.getDoc(docId)
          docsToImport.push(doc)
        }
      } else {
        // 导入所有文档（从知识库）
        const docs = await yuqueClient.getDocs()
        for (const doc of docs) {
          const detail = await yuqueClient.getDoc(String(doc.id))
          docsToImport.push(detail)
        }
      }

      result.totalItems = docsToImport.length

      // 逐个导入
      for (const yuqueDoc of docsToImport) {
        try {
          // 检查是否已存在映射
          const existing = await prisma.articleMapping.findUnique({
            where: { docId: BigInt(yuqueDoc.id) },
          })

          if (existing && !options.options?.force) {
            result.skippedItems++
            await this.logSync(jobId, {
              operation: 'import',
              direction: 'yuque_to_blog',
              status: 'warning',
              message: '文档已映射，跳过导入',
              docId: BigInt(yuqueDoc.id),
            })
            continue
          }

          // 映射字段
          const articleData = await mapper.yuqueToBlog(yuqueDoc, {
            categoryId: options.options?.categoryId,
          })

          // 创建或更新文章
          let articleId: number
          if (existing) {
            // 更新现有文章
            await blogClient.updateArticle(existing.articleId.toNumber(), articleData)
            articleId = existing.articleId.toNumber()

            // 更新映射
            await prisma.articleMapping.update({
              where: { id: existing.id },
              data: {
                lastSyncTime: new Date(),
                syncDirection: 'yuque_to_blog',
                syncCount: { increment: 1 },
                lastSyncStatus: 'success',
              },
            })
          } else {
            // 创建新文章
            const article = await blogClient.createArticle(articleData)
            articleId = article.id

            // 创建映射
            await prisma.articleMapping.create({
              data: {
                articleId: BigInt(articleId),
                articleKey: article.article_key,
                docId: BigInt(yuqueDoc.id),
                docSlug: yuqueDoc.slug,
                docTitle: yuqueDoc.title,
                bookId: BigInt(yuqueDoc.book_id),
                lastSyncTime: new Date(),
                syncDirection: 'yuque_to_blog',
                syncCount: 1,
                lastSyncStatus: 'success',
              },
            })
          }

          result.successItems++
          result.processedItems++

          await this.logSync(jobId, {
            operation: 'import',
            direction: 'yuque_to_blog',
            status: 'success',
            message: `成功导入: ${yuqueDoc.title}`,
            docId: BigInt(yuqueDoc.id),
            articleId: BigInt(articleId),
          })

          // 更新进度
          await prisma.syncJob.update({
            where: { id: jobId },
            data: {
              processedItems: result.processedItems,
              successItems: result.successItems,
              currentItemName: yuqueDoc.title,
            },
          })
        } catch (error) {
          result.failedItems++
          result.processedItems++

          const errorMsg = error instanceof Error ? error.message : '未知错误'
          result.errors.push({
            item: yuqueDoc.title,
            error: errorMsg,
          })

          await this.logSync(jobId, {
            operation: 'import',
            direction: 'yuque_to_blog',
            status: 'failed',
            message: `导入失败: ${yuqueDoc.title}`,
            errorMessage: errorMsg,
            docId: BigInt(yuqueDoc.id),
          })
        }
      }
    } catch (error) {
      console.error('导入失败:', error)
      throw error
    }

    return result
  }

  /**
   * 执行导出（博客 → 语雀）
   */
  private async executeExport(
    jobId: string,
    options: SyncJobOptions
  ): Promise<SyncJobResult> {
    const yuqueClient = await createYuqueClient()
    const blogClient = await createBlogClient()
    const mapper = await createFieldMapper()

    const result: SyncJobResult = {
      totalItems: 0,
      processedItems: 0,
      successItems: 0,
      failedItems: 0,
      skippedItems: 0,
      errors: [],
    }

    try {
      // 获取要导出的文章
      const articlesToExport: BlogArticle[] = []

      if (options.articleIds && options.articleIds.length > 0) {
        // 导出指定文章
        for (const articleId of options.articleIds) {
          const article = await blogClient.getArticleById(articleId)
          if (article) {
            articlesToExport.push(article)
          }
        }
      } else {
        // 导入所有已发布文章
        const articles = await blogClient.getArticles({
          status: 1, // 已发布
        })
        articlesToExport.push(...articles)
      }

      result.totalItems = articlesToExport.length

      // 获取知识库ID
      const namespace = (await yuqueClient as any).config.namespace
      const bookId = namespace // 或通过API获取

      // 逐个导出
      for (const article of articlesToExport) {
        try {
          // 检查是否已存在映射
          const existing = await prisma.articleMapping.findUnique({
            where: { articleId: BigInt(article.id) },
          })

          if (existing && !options.options?.force) {
            result.skippedItems++
            await this.logSync(jobId, {
              operation: 'export',
              direction: 'blog_to_yuque',
              status: 'warning',
              message: '文章已映射，跳过导出',
              articleId: BigInt(article.id),
            })
            continue
          }

          // 映射字段
          const docData = await mapper.blogToYuque(article)

          // 创建或更新语雀文档
          let docId: string
          if (existing) {
            // 更新现有文档
            await yuqueClient.updateDoc(String(existing.docId), docData)
            docId = String(existing.docId)

            // 更新映射
            await prisma.articleMapping.update({
              where: { id: existing.id },
              data: {
                lastSyncTime: new Date(),
                syncDirection: 'blog_to_yuque',
                syncCount: { increment: 1 },
                lastSyncStatus: 'success',
              },
            })
          } else {
            // 创建新文档
            const newDoc = await yuqueClient.createDoc(bookId, docData)
            docId = String(newDoc.id)

            // 创建映射
            await prisma.articleMapping.create({
              data: {
                articleId: BigInt(article.id),
                articleKey: article.article_key,
                docId: BigInt(docId),
                docSlug: docData.slug,
                docTitle: docData.title,
                bookId: BigInt(bookId),
                lastSyncTime: new Date(),
                syncDirection: 'blog_to_yuque',
                syncCount: 1,
                lastSyncStatus: 'success',
              },
            })
          }

          result.successItems++
          result.processedItems++

          await this.logSync(jobId, {
            operation: 'export',
            direction: 'blog_to_yuque',
            status: 'success',
            message: `成功导出: ${article.title}`,
            articleId: BigInt(article.id),
            docId: BigInt(docId),
          })

          // 更新进度
          await prisma.syncJob.update({
            where: { id: jobId },
            data: {
              processedItems: result.processedItems,
              successItems: result.successItems,
              currentItemName: article.title,
            },
          })
        } catch (error) {
          result.failedItems++
          result.processedItems++

          const errorMsg = error instanceof Error ? error.message : '未知错误'
          result.errors.push({
            item: article.title,
            error: errorMsg,
          })

          await this.logSync(jobId, {
            operation: 'export',
            direction: 'blog_to_yuque',
            status: 'failed',
            message: `导出失败: ${article.title}`,
            errorMessage: errorMsg,
            articleId: BigInt(article.id),
          })
        }
      }
    } catch (error) {
      console.error('导出失败:', error)
      throw error
    }

    return result
  }

  /**
   * 执行双向同步
   */
  private async executeSync(
    jobId: string,
    options: SyncJobOptions
  ): Promise<SyncJobResult> {
    // 双向同步 = 先导入再导出
    const importResult = await this.executeImport(jobId, {
      ...options,
      type: 'import',
    })

    const exportResult = await this.executeExport(jobId, {
      ...options,
      type: 'export',
    })

    return {
      totalItems: importResult.totalItems + exportResult.totalItems,
      processedItems: importResult.processedItems + exportResult.processedItems,
      successItems: importResult.successItems + exportResult.successItems,
      failedItems: importResult.failedItems + exportResult.failedItems,
      skippedItems: importResult.skippedItems + exportResult.skippedItems,
      errors: [...importResult.errors, ...exportResult.errors],
    }
  }

  /**
   * 获取任务状态
   */
  async getJobStatus(jobId: string) {
    const job = await prisma.syncJob.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      throw new Error('任务不存在')
    }

    return {
      id: job.id,
      type: job.jobType,
      direction: job.syncDirection,
      status: job.status,
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      successItems: job.successItems,
      failedItems: job.failedItems,
      skippedItems: job.skippedItems,
      startTime: job.startTime,
      endTime: job.endTime,
      duration: job.duration,
      errorMessage: job.errorMessage,
      currentItemName: job.currentItemName,
    }
  }

  /**
   * 取消任务
   */
  async cancelJob(jobId: string): Promise<void> {
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'cancelled',
        endTime: new Date(),
      },
    })
  }

  /**
   * 记录同步日志
   */
  private async logSync(
    jobId: string,
    data: {
      operation: string
      direction: string
      status: string
      message: string
      articleId?: bigint
      docId?: bigint
      errorMessage?: string
    }
  ) {
    await prisma.syncLog.create({
      data: {
        jobId,
        operation: data.operation,
        direction: data.direction,
        status: data.status,
        message: data.message,
        articleId: data.articleId,
        docId: data.docId,
        errorMessage: data.errorMessage,
      },
    })
  }
}

// 单例实例
let syncEngineInstance: SyncEngine | null = null

export function getSyncEngine(): SyncEngine {
  if (!syncEngineInstance) {
    syncEngineInstance = new SyncEngine()
  }
  return syncEngineInstance
}
