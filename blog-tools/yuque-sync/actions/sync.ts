'use server'

import { getSyncEngine } from '@/lib/sync/engine'

export interface SyncOptions {
  direction: 'yuque_to_blog' | 'blog_to_yuque' | 'bidirectional'
  scope?: 'all' | 'recent' | 'failed'
  conflictStrategy?: 'skip' | 'overwrite' | 'merge' | 'ask'
  force?: boolean
}

export async function createSyncJob(options: SyncOptions) {
  try {
    const engine = getSyncEngine()

    // 创建同步任务
    const jobId = await engine.createJob({
      type: 'sync',
      direction: options.direction,
      options: {
        force: options.force,
      },
    })

    // 异步执行同步
    engine.executeJob(jobId).catch(error => {
      console.error('Sync job failed:', error)
    })

    return {
      success: true,
      jobId,
      message: '同步任务已创建',
    }
  } catch (error) {
    console.error('Failed to create sync job:', error)
    return {
      success: false,
      jobId: '',
      message: error instanceof Error ? error.message : '创建同步任务失败',
    }
  }
}
