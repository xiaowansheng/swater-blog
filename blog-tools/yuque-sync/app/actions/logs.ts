'use server'

import { prisma } from '@/lib/db/prisma'

export interface GetLogsParams {
  page?: number
  pageSize?: number
  status?: string
}

export async function getLogs(params?: GetLogsParams) {
  try {
    const page = params?.page || 1
    const pageSize = params?.pageSize || 50
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (params?.status) {
      where.status = params.status
    }

    const [logs, total] = await Promise.all([
      prisma.syncLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.syncLog.count({ where }),
    ])

    return {
      success: true,
      data: logs.map((log) => ({
        ...log,
        articleId: log.articleId?.toString(),
        docId: log.docId?.toString(),
      })),
      total,
    }
  } catch (error) {
    console.error('Failed to get logs:', error)
    return {
      success: false,
      data: [],
      total: 0,
      message: '获取日志失败',
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
