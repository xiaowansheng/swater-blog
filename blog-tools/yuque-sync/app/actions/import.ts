'use server'

import { getSyncEngine } from '@/lib/sync/engine'

export interface ImportOptions {
  docIds?: number[]
  bookId?: number
}

export async function importFromYuque(options: ImportOptions) {
  try {
    const engine = getSyncEngine()

    const jobId = await engine.createJob({
      type: 'import',
      direction: 'yuque_to_blog',
      config: JSON.stringify(options),
    })

    // 异步执行任务
    engine.executeJob(jobId).catch(console.error)

    return {
      success: true,
      jobId,
      message: '导入任务已创建',
    }
  } catch (error: any) {
    console.error('Failed to create import job:', error)
    return {
      success: false,
      message: error.message || '创建导入任务失败',
    }
  }
}

export async function getYuqueDocs() {
  try {
    const { YuqueClient } = await import('@/lib/yuque/client')
    const { getConfig } = await import('./config')

    const configResult = await getConfig()
    if (!configResult.success) {
      return {
        success: false,
        data: [],
        message: '获取配置失败',
      }
    }

    const client = new YuqueClient({
      token: configResult.data.yuque_token || '',
      namespace: configResult.data.yuque_namespace || '',
    })

    const bookId = configResult.data.yuque_book_id
      ? parseInt(configResult.data.yuque_book_id)
      : undefined

    const docs = await client.getDocs({ bookId })

    return {
      success: true,
      data: docs,
    }
  } catch (error: any) {
    console.error('Failed to get Yuque docs:', error)
    return {
      success: false,
      data: [],
      message: error.message || '获取语雀文档失败',
    }
  }
}
