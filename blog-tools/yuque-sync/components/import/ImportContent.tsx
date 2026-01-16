'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getYuqueDocs, importFromYuque } from '@/app/actions/import'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface YuqueDoc {
  id: number
  title: string
  description?: string
  slug: string
  created_at: string
  updated_at: string
}

export function ImportContent() {
  const router = useRouter()
  const [docs, setDocs] = useState<YuqueDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')

  // 加载语雀文档列表
  const loadDocs = async () => {
    setLoading(true)
    try {
      const result = await getYuqueDocs()
      if (result.success) {
        setDocs(result.data)
      } else {
        toast.error(result.message || '加载文档列表失败')
      }
    } catch (error) {
      toast.error('加载文档列表时发生错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocs()
  }, [])

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
    if (selectedIds.size === filteredDocs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredDocs.map(d => d.id)))
    }
  }

  // 执行导入
  const handleImport = async () => {
    if (selectedIds.size === 0) {
      toast.error('请先选择要导入的文档')
      return
    }

    setImporting(true)
    try {
      const result = await importFromYuque({
        docIds: Array.from(selectedIds).map(String),
        publish: false,
        force: false,
      })

      if (result.success) {
        toast.success('导入任务已创建')
        router.push(`/sync/job/${result.jobId}`)
      } else {
        toast.error(result.message || '创建导入任务失败')
      }
    } catch (error) {
      toast.error('导入时发生错误')
    } finally {
      setImporting(false)
    }
  }

  // 过滤文档
  const filteredDocs = docs.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧：文档列表 */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>语雀文档列表</CardTitle>
                <CardDescription>
                  共 {docs.length} 篇文档
                  {filteredDocs.length !== docs.length && `（筛选后 ${filteredDocs.length} 篇）`}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={loadDocs} disabled={loading}>
                {loading ? '加载中...' : '刷新'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 搜索框 */}
            <div className="mb-4">
              <Input
                placeholder="搜索文档标题或描述..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* 全选按钮 */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredDocs.length && filteredDocs.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                已选择 {selectedIds.size} 篇
              </span>
            </div>

            {/* 文档列表 */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : filteredDocs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {search ? '没有找到匹配的文档' : '暂无文档'}
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {doc.title}
                      </div>
                      {doc.description && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {doc.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        更新于 {new Date(doc.updated_at).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：导入选项 */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>导入选项</CardTitle>
            <CardDescription>配置导入行为</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">自动发布</label>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">强制覆盖</label>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                />
              </div>

              <Button
                onClick={handleImport}
                disabled={importing || selectedIds.size === 0}
                className="w-full"
              >
                {importing ? '导入中...' : `导入 ${selectedIds.size} 篇文档`}
              </Button>

              <div className="text-xs text-gray-500">
                <p>💡 提示：</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>首次导入会自动创建映射关系</li>
                  <li>已导入的文档会自动跳过</li>
                  <li>可以开启"强制覆盖"重新导入</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
