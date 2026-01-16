'use server'

import { prisma } from '@/lib/db/prisma'

export async function getMappings(params?: {
  page?: number
  pageSize?: number
  articleId?: number
  docId?: number
}) {
  try {
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (params?.articleId) {
      where.articleId = BigInt(params.articleId)
    }
    if (params?.docId) {
      where.docId = BigInt(params.docId)
    }

    const [mappings, total] = await Promise.all([
      prisma.articleMapping.findMany({
        where,
        orderBy: { lastSyncTime: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.articleMapping.count({ where }),
    ])

    return {
      success: true,
      data: mappings.map(m => ({
        ...m,
        articleId: Number(m.articleId),
        docId: Number(m.docId),
        bookId: m.bookId ? Number(m.bookId) : undefined,
      })),
      total,
      page,
      pageSize,
    }
  } catch (error) {
    console.error('Failed to get mappings:', error)
    return {
      success: false,
      data: [],
      total: 0,
      message: error instanceof Error ? error.message : '获取映射关系失败',
    }
  }
}

export async function deleteMapping(id: string) {
  try {
    await prisma.articleMapping.delete({
      where: { id },
    })

    return { success: true, message: '映射关系已删除' }
  } catch (error) {
    console.error('Failed to delete mapping:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '删除映射关系失败',
    }
  }
}

export async function syncSingleMapping(id: string) {
  try {
    const mapping = await prisma.articleMapping.findUnique({
      where: { id },
    })

    if (!mapping) {
      return { success: false, message: '映射关系不存在' }
    }

    const { getSyncEngine } = await import('@/lib/sync/engine')
    const engine = getSyncEngine()

    // 创建同步任务
    const jobId = await engine.createJob({
      type: 'sync',
      direction: 'bidirectional',
      articleIds: [Number(mapping.articleId)],
    })

    // 异步执行
    engine.executeJob(jobId).catch(error => {
      console.error('Sync job failed:', error)
    })

    return {
      success: true,
      jobId,
      message: '同步任务已创建',
    }
  } catch (error) {
    console.error('Failed to sync mapping:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '同步失败',
    }
  }
}
