'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getJobStatus, cancelJob } from '@/app/actions/job'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface JobStatus {
  id: string
  type: string
  direction: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  totalItems: number
  processedItems: number
  successItems: number
  failedItems: number
  skippedItems: number
  startTime?: Date
  endTime?: Date
  duration?: number
  errorMessage?: string
  currentItemName?: string
}

interface JobProgressProps {
  jobId: string
}

export function JobProgress({ jobId }: JobProgressProps) {
  const router = useRouter()
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCanceling] = useState(false)

  // 轮询任务状态
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const result = await getJobStatus(jobId)
        if (result.success && result.data) {
          setStatus(result.data)

          // 如果任务还在运行，继续轮询
          if (
            result.data.status === 'pending' ||
            result.data.status === 'running'
          ) {
            setTimeout(pollStatus, 1000)
          } else {
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to poll job status:', error)
        setLoading(false)
      }
    }

    pollStatus()
  }, [jobId])

  // 取消任务
  const handleCancel = async () => {
    if (!confirm('确定要取消这个任务吗？')) {
      return
    }

    setCanceling(true)
    try {
      const result = await cancelJob(jobId)
      if (result.success) {
        toast.success('任务已取消')
        setStatus(prev => prev ? { ...prev, status: 'cancelled' as any } : null)
      } else {
        toast.error(result.message || '取消任务失败')
      }
    } catch (error) {
      toast.error('取消任务时发生错误')
    } finally {
      setCanceling(false)
    }
  }

  if (loading || !status) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">加载中...</div>
        </CardContent>
      </Card>
    )
  }

  // 计算进度百分比
  const percentage = status.totalItems > 0
    ? Math.round((status.processedItems / status.totalItems) * 100)
    : 0

  // 获取状态颜色
  const getStatusColor = () => {
    switch (status.status) {
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'running':
        return 'text-blue-600'
      case 'cancelled':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  // 获取状态标签
  const getStatusLabel = () => {
    switch (status.status) {
      case 'pending':
        return '⏳ 等待中'
      case 'running':
        return '⟳ 运行中'
      case 'completed':
        return '✓ 完成'
      case 'failed':
        return '✗ 失败'
      case 'cancelled':
        return '○ 已取消'
      default:
        return status.status
    }
  }

  // 获取任务类型标签
  const getTypeLabel = () => {
    switch (status.type) {
      case 'import':
        return '导入'
      case 'export':
        return '导出'
      case 'sync':
        return '同步'
      default:
        return status.type
    }
  }

  return (
    <div className="space-y-6">
      {/* 任务状态 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>任务状态</CardTitle>
              <CardDescription>任务ID: {jobId}</CardDescription>
            </div>
            {status.status === 'running' && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? '取消中...' : '取消任务'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 状态和类型 */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">任务状态</div>
                <div className={`text-2xl font-bold ${getStatusColor()}`}>
                  {getStatusLabel()}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">任务类型</div>
                <div className="text-2xl font-bold">{getTypeLabel()}</div>
              </div>
            </div>

            {/* 进度条 */}
            {status.totalItems > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    处理进度: {status.processedItems} / {status.totalItems}
                  </span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* 当前处理项 */}
            {status.currentItemName && (
              <div className="text-sm text-gray-600">
                正在处理: {status.currentItemName}
              </div>
            )}

            {/* 统计信息 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{status.totalItems}</div>
                <div className="text-xs text-gray-600">总计</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {status.successItems}
                </div>
                <div className="text-xs text-gray-600">成功</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {status.failedItems}
                </div>
                <div className="text-xs text-gray-600">失败</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {status.skippedItems}
                </div>
                <div className="text-xs text-gray-600">跳过</div>
              </div>
            </div>

            {/* 时间信息 */}
            {status.startTime && (
              <div className="text-sm text-gray-600">
                开始时间: {new Date(status.startTime).toLocaleString('zh-CN')}
              </div>
            )}
            {status.endTime && (
              <div className="text-sm text-gray-600">
                结束时间: {new Date(status.endTime).toLocaleString('zh-CN')}
              </div>
            )}
            {status.duration && (
              <div className="text-sm text-gray-600">
                耗时: {Math.round(status.duration / 1000)}秒
              </div>
            )}

            {/* 错误信息 */}
            {status.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="font-medium text-red-900 mb-2">错误信息</div>
                <div className="text-sm text-red-800">{status.errorMessage}</div>
              </div>
            )}

            {/* 完成后的操作 */}
            {(status.status === 'completed' ||
              status.status === 'failed' ||
              status.status === 'cancelled') && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => router.push('/logs')}
                  variant="outline"
                >
                  查看详细日志
                </Button>
                <Button onClick={() => router.push('/dashboard')}>
                  返回仪表盘
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
