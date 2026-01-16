'use server'

import { getSyncEngine } from '@/lib/sync/engine'

export interface ExportOptions {
  articleIds?: number[]
}

export async function exportToYuque(options: ExportOptions) {
  try {
    const engine = getSyncEngine()

    const jobId = await engine.createJob({
      type: 'export',
      direction: 'blog_to_yuque',
      config: JSON.stringify(options),
    })

    // 异步执行任务
    engine.executeJob(jobId).catch(console.error)

    return {
      success: true,
      jobId,
      message: '导出任务已创建',
    }
  } catch (error: any) {
    console.error('Failed to create export job:', error)
    return {
      success: false,
      message: error.message || '创建导出任务失败',
    }
  }
}

export async function getBlogArticles() {
  try {
    const { BlogClient } = await import('@/lib/blog/client')
    const { getConfig } = await import('./config')

    const configResult = await getConfig()
    if (!configResult.success) {
      return {
        success: false,
        data: [],
        message: '获取配置失败',
      }
    }

    const client = new BlogClient({
      host: configResult.data.db_host || 'localhost',
      port: parseInt(configResult.data.db_port || '3306'),
      user: configResult.data.db_user || 'root',
      password: configResult.data.db_password || '',
      database: configResult.data.db_name || '',
    })

    const articles = await client.getArticles()

    return {
      success: true,
      data: articles,
    }
  } catch (error: any) {
    console.error('Failed to get blog articles:', error)
    return {
      success: false,
      data: [],
      message: error.message || '获取博客文章失败',
    }
  }
}
