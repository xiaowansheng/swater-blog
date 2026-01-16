'use server'

import { prisma } from '@/lib/db/prisma'

export async function getLogs(params?: {
  page?: number
  pageSize?: number
  jobId?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  try {
    const page = params?.page || 1
    const pageSize = params?.pageSize || 50
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (params?.jobId) {
      where.jobId = params.jobId
    }
    if (params?.status) {
      where.status = params.status
    }
    if (params?.startDate || params?.endDate) {
      where.createdAt = {}
      if (params?.startDate) {
        where.createdAt.gte = new Date(params.startDate)
      }
      if (params?.endDate) {
        where.createdAt.lte = new Date(params.endDate)
      }
    }

    const [logs, total] = await Promise.all([
      prisma.syncLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.syncLog.count({ where }),
    ])

    return {
      success: true,
      data: logs.map(l => ({
        ...l,
        articleId: l.articleId ? Number(l.articleId) : undefined,
        docId: l.docId ? Number(l.docId) : undefined,
      })),
      total,
      page,
      pageSize,
    }
  } catch (error) {
    console.error('Failed to get logs:', error)
    return {
      success: false,
      data: [],
      total: 0,
      message: error instanceof Error ? error.message : '获取日志失败',
    }
  }
}

export async function getLogStats() {
  try {
    const [total, success, failed, warning] = await Promise.all([
      prisma.syncLog.count(),
      prisma.syncLog.count({ where: { status: 'success' } }),
      prisma.syncLog.count({ where: { status: 'failed' } }),
      prisma.syncLog.count({ where: { status: 'warning' } }),
    ])

    return {
      success: true,
      total,
      success,
      failed,
      warning,
    }
  } catch (error) {
    console.error('Failed to get log stats:', error)
    return {
      success: false,
      total: 0,
      success: 0,
      failed: 0,
      warning: 0,
    }
  }
}
