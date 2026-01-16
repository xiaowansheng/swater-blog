'use server'

import { getSyncEngine } from '@/lib/sync/engine'

export interface SyncOptions {
  direction: 'yuque_to_blog' | 'blog_to_yuque' | 'bidirectional'
  forceOverride?: boolean
}

export async function bidirectionalSync(options: SyncOptions) {
  try {
    const engine = getSyncEngine()

    const jobId = await engine.createJob({
      type: 'sync',
      direction: options.direction,
      config: JSON.stringify(options),
    })

    // 异步执行任务
    engine.executeJob(jobId).catch(console.error)

    return {
      success: true,
      jobId,
      message: '同步任务已创建',
    }
  } catch (error: any) {
    console.error('Failed to create sync job:', error)
    return {
      success: false,
      message: error.message || '创建同步任务失败',
    }
  }
}
