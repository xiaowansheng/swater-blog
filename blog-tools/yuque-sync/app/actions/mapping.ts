'use server'

import { prisma } from '@/lib/db/prisma'

export interface GetMappingsParams {
  page?: number
  pageSize?: number
  articleId?: number
}

export async function getMappings(params?: GetMappingsParams) {
  try {
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const skip = (page - 1) * pageSize

    const where = params?.articleId ? { articleId: BigInt(params.articleId) } : {}

    const [mappings, total] = await Promise.all([
      prisma.articleMapping.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { lastSyncTime: 'desc' },
      }),
      prisma.articleMapping.count({ where }),
    ])

    return {
      success: true,
      data: mappings.map((m) => ({
        ...m,
        articleId: m.articleId.toString(),
        docId: m.docId.toString(),
        bookId: m.bookId?.toString(),
      })),
      total,
    }
  } catch (error) {
    console.error('Failed to get mappings:', error)
    return {
      success: false,
      data: [],
      total: 0,
      message: '获取映射失败',
    }
  }
}

export async function deleteMapping(id: string) {
  try {
    await prisma.articleMapping.delete({
      where: { id },
    })

    return {
      success: true,
      message: '删除成功',
    }
  } catch (error) {
    console.error('Failed to delete mapping:', error)
    return {
      success: false,
      message: '删除失败',
    }
  }
}

export async function syncSingleMapping(id: string) {
  try {
    const { getSyncEngine } = await import('@/lib/sync/engine')
    const engine = getSyncEngine()

    const mapping = await prisma.articleMapping.findUnique({
      where: { id },
    })

    if (!mapping) {
      return {
        success: false,
        message: '映射不存在',
      }
    }

    const jobId = await engine.createJob({
      type: 'sync',
      direction: 'bidirectional',
      config: JSON.stringify({
        articleId: mapping.articleId.toString(),
        docId: mapping.docId.toString(),
      }),
    })

    engine.executeJob(jobId).catch(console.error)

    return {
      success: true,
      jobId,
      message: '同步任务已创建',
    }
  } catch (error: any) {
    console.error('Failed to sync mapping:', error)
    return {
      success: false,
      message: error.message || '同步失败',
    }
  }
}
