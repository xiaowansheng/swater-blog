'use server'

import { revalidatePath } from 'next/cache'
import { getSyncEngine } from '@/lib/sync/engine'

export interface ExportOptions {
  articleIds?: number[]
  all?: boolean
  status?: 0 | 1 | 2 // 0:草稿, 1:已发布, 2:私密
  format?: 'markdown' | 'html'
  publish?: boolean
  force?: boolean
}

export async function exportToYuque(options: ExportOptions) {
  try {
    const engine = getSyncEngine()

    // 创建导出任务
    const jobId = await engine.createJob({
      type: 'export',
      direction: 'blog_to_yuque',
      articleIds: options.articleIds,
      options: {
        publish: options.publish,
        force: options.force,
      },
    })

    // 异步执行导出
    engine.executeJob(jobId).catch(error => {
      console.error('Export job failed:', error)
    })

    revalidatePath('/export')
    revalidatePath('/dashboard')

    return {
      success: true,
      jobId,
      message: '导出任务已创建',
    }
  } catch (error) {
    console.error('Failed to create export job:', error)
    return {
      success: false,
      jobId: '',
      message: error instanceof Error ? error.message : '创建导出任务失败',
    }
  }
}

export async function getBlogArticles(params: {
  page?: number
  pageSize?: number
  status?: number
}) {
  try {
    const { createBlogClient } = await import('@/lib/blog/client')
    const client = await createBlogClient()

    const articles = await client.getArticles({
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      status: params.status as any,
    })

    return { success: true, data: articles }
  } catch (error) {
    console.error('Failed to get blog articles:', error)
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : '获取文章列表失败',
    }
  }
}

export async function testBlogConnection() {
  try {
    const { createBlogClient } = await import('@/lib/blog/client')
    const client = await createBlogClient()
    const success = await client.testConnection()
    return {
      success,
      message: success ? '连接成功' : '连接失败',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '连接测试失败',
    }
  }
}
