'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportToYuque, getBlogArticles } from '@/app/actions/export'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BlogArticle {
  id: number
  title: string
  slug: string
  excerpt?: string
  status: number
  created_at: Date
  updated_at: Date
}

export function ExportContent() {
  const router = useRouter()
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | undefined>()

  // 加载博客文章列表
  const loadArticles = async () => {
    setLoading(true)
    try {
      const result = await getBlogArticles({
        pageSize: 100,
        status: statusFilter,
      })
      if (result.success) {
        setArticles(result.data)
      } else {
        toast.error(result.message || '加载文章列表失败')
      }
    } catch (error) {
      toast.error('加载文章列表时发生错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [statusFilter])

  // 切换选择
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredArticles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredArticles.map(a => a.id)))
    }
  }

  // 执行导出
  const handleExport = async () => {
    if (selectedIds.size === 0) {
      toast.error('请先选择要导出的文章')
      return
    }

    setExporting(true)
    try {
      const result = await exportToYuque({
        articleIds: Array.from(selectedIds),
        publish: false,
        force: false,
      })

      if (result.success) {
        toast.success('导出任务已创建')
        router.push(`/sync/job/${result.jobId}`)
      } else {
        toast.error(result.message || '创建导出任务失败')
      }
    } catch (error) {
      toast.error('导出时发生错误')
    } finally {
      setExporting(false)
    }
  }

  // 过滤文章
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(search.toLowerCase()))
  )

  // 状态标签
  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return '草稿'
      case 1: return '已发布'
      case 2: return '私密'
      default: return '未知'
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-gray-600'
      case 1: return 'text-green-600'
      case 2: return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧：文章列表 */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>博客文章列表</CardTitle>
                <CardDescription>
                  共 {articles.length} 篇文章
                  {filteredArticles.length !== articles.length && `（筛选后 ${filteredArticles.length} 篇）`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border rounded-md text-sm"
                  value={statusFilter ?? ''}
                  onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">全部状态</option>
                  <option value="1">已发布</option>
                  <option value="0">草稿</option>
                  <option value="2">私密</option>
                </select>
                <Button variant="outline" onClick={loadArticles} disabled={loading}>
                  {loading ? '加载中...' : '刷新'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 搜索框 */}
            <div className="mb-4">
              <Input
                placeholder="搜索文章标题或摘要..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* 全选按钮 */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredArticles.length && filteredArticles.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                已选择 {selectedIds.size} 篇
              </span>
            </div>

            {/* 文章列表 */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {search ? '没有找到匹配的文章' : '暂无文章'}
                </div>
              ) : (
                filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(article.id)}
                      onChange={() => toggleSelect(article.id)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {article.title}
                      </div>
                      {article.excerpt && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {article.excerpt}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className={getStatusColor(article.status)}>
                          {getStatusLabel(article.status)}
                        </span>
                        <span>更新于 {new Date(article.updated_at).toLocaleString('zh-CN')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：导出选项 */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>导出选项</CardTitle>
            <CardDescription>配置导出行为</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">内容格式</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">自动发布</label>
                <input type="checkbox" className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">强制覆盖</label>
                <input type="checkbox" className="w-4 h-4" />
              </div>

              <Button
                onClick={handleExport}
                disabled={exporting || selectedIds.size === 0}
                className="w-full"
              >
                {exporting ? '导出中...' : `导出 ${selectedIds.size} 篇文章`}
              </Button>

              <div className="text-xs text-gray-500">
                <p>💡 提示：</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>导出会创建语雀文档</li>
                  <li>已导出的文章会自动跳过</li>
                  <li>可以开启"强制覆盖"重新导出</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
