'use server'

import { getSyncEngine } from '@/lib/sync/engine'

export async function getJobStatus(jobId: string) {
  try {
    const engine = getSyncEngine()
    const status = await engine.getJobStatus(jobId)
    return {
      success: true,
      data: status,
    }
  } catch (error) {
    console.error('Failed to get job status:', error)
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '获取任务状态失败',
    }
  }
}

export async function cancelJob(jobId: string) {
  try {
    const engine = getSyncEngine()
    await engine.cancelJob(jobId)
    return {
      success: true,
      message: '任务已取消',
    }
  } catch (error) {
    console.error('Failed to cancel job:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '取消任务失败',
    }
  }
}
