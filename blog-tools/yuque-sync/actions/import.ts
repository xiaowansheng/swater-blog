'use server'

import { revalidatePath } from 'next/cache'
import { getSyncEngine } from '@/lib/sync/engine'

export interface ImportOptions {
  docIds?: string[]
  all?: boolean
  categoryId?: number
  publish?: boolean
  force?: boolean
}

export async function importFromYuque(options: ImportOptions) {
  try {
    const engine = getSyncEngine()

    // 创建导入任务
    const jobId = await engine.createJob({
      type: 'import',
      direction: 'yuque_to_blog',
      docIds: options.docIds,
      options: {
        categoryId: options.categoryId,
        publish: options.publish,
        force: options.force,
      },
    })

    // 异步执行导入
    engine.executeJob(jobId).catch(error => {
      console.error('Import job failed:', error)
    })

    revalidatePath('/import')
    revalidatePath('/dashboard')

    return {
      success: true,
      jobId,
      message: '导入任务已创建',
    }
  } catch (error) {
    console.error('Failed to create import job:', error)
    return {
      success: false,
      jobId: '',
      message: error instanceof Error ? error.message : '创建导入任务失败',
    }
  }
}

export async function getYuqueDocs() {
  try {
    const { createYuqueClient } = await import('@/lib/yuque/client')
    const client = await createYuqueClient()
    const docs = await client.getDocs()
    return { success: true, data: docs }
  } catch (error) {
    console.error('Failed to get Yuque docs:', error)
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : '获取文档列表失败',
    }
  }
}

export async function testYuqueConnection() {
  try {
    const { createYuqueClient } = await import('@/lib/yuque/client')
    const client = await createYuqueClient()
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
