'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getMappings, deleteMapping, syncSingleMapping } from '@/app/actions/mapping'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ArticleMapping {
  id: string
  articleId: number
  articleKey: string
  docId: number
  docSlug: string
  docTitle: string
  bookId?: number
  lastSyncTime?: Date
  syncDirection?: string
  syncCount: number
  lastSyncStatus?: string
}

export function MappingContent() {
  const router = useRouter()
  const [mappings, setMappings] = useState<ArticleMapping[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20

  // 加载映射列表
  const loadMappings = async () => {
    setLoading(true)
    try {
      const result = await getMappings({ page, pageSize })
      if (result.success) {
        setMappings(result.data)
        setTotal(result.total)
      } else {
        toast.error(result.message || '加载映射关系失败')
      }
    } catch (error) {
      toast.error('加载映射关系时发生错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMappings()
  }, [page])

  // 删除映射
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个映射关系吗？')) {
      return
    }

    try {
      const result = await deleteMapping(id)
      if (result.success) {
        toast.success('映射关系已删除')
        loadMappings()
      } else {
        toast.error(result.message || '删除失败')
      }
    } catch (error) {
      toast.error('删除时发生错误')
    }
  }

  // 单个同步
  const handleSync = async (id: string) => {
    try {
      const result = await syncSingleMapping(id)
      if (result.success) {
        toast.success('同步任务已创建')
        router.push(`/sync/job/${result.jobId}`)
      } else {
        toast.error(result.message || '创建同步任务失败')
      }
    } catch (error) {
      toast.error('同步时发生错误')
    }
  }

  // 格式化时间
  const formatDate = (date?: Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('zh-CN')
  }

  // 获取方向标签
  const getDirectionLabel = (direction?: string) => {
    switch (direction) {
      case 'yuque_to_blog':
        return '语雀→博客'
      case 'blog_to_yuque':
        return '博客→语雀'
      case 'bidirectional':
        return '双向'
      default:
        return '-'
    }
  }

  // 获取状态标签
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'success':
        return '✓ 成功'
      case 'failed':
        return '✗ 失败'
      default:
        return '-'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              总映射数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              已同步
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mappings.filter(m => m.lastSyncStatus === 'success').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              同步失败
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {mappings.filter(m => m.lastSyncStatus === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 映射列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>映射关系列表</CardTitle>
              <CardDescription>
                博客文章与语雀文档的对应关系
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadMappings} disabled={loading}>
              {loading ? '刷新中...' : '刷新'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无映射关系，请先进行导入或导出操作
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        博客文章
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        语雀文档
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        最后同步
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        同步方向
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        次数
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        状态
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((mapping) => (
                      <tr key={mapping.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              #{mapping.articleId}
                            </div>
                            <div className="text-sm text-gray-600">
                              {mapping.articleKey}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              #{mapping.docId}
                            </div>
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {mapping.docTitle || mapping.docSlug}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(mapping.lastSyncTime)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {getDirectionLabel(mapping.syncDirection)}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {mapping.syncCount}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={getStatusColor(mapping.lastSyncStatus)}>
                            {getStatusLabel(mapping.lastSyncStatus)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSync(mapping.id)}
                            >
                              同步
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(mapping.id)}
                            >
                              删除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {total > pageSize && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    共 {total} 条记录，第 {page} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * pageSize >= total}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
