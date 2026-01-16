'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bidirectionalSync } from '@/app/actions/sync'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SyncContent() {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [direction, setDirection] = useState<'yuque_to_blog' | 'blog_to_yuque' | 'bidirectional'>('bidirectional')
  const [force, setForce] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await bidirectionalSync({
        direction,
        forceOverride: force,
      })

      if (result.success) {
        toast.success('同步任务已创建')
        router.push(`/sync/job/${result.jobId}`)
      } else {
        toast.error(result.message || '创建同步任务失败')
      }
    } catch (error) {
      toast.error('创建同步任务时发生错误')
    } finally {
      setSyncing(false)
    }
  }

  const getDirectionLabel = (dir: string) => {
    switch (dir) {
      case 'yuque_to_blog':
        return '语雀 → 博客'
      case 'blog_to_yuque':
        return '博客 → 语雀'
      case 'bidirectional':
        return '双向同步'
      default:
        return dir
    }
  }

  const getDirectionDescription = (dir: string) => {
    switch (dir) {
      case 'yuque_to_blog':
        return '从语雀导入更新到博客（覆盖博客文章）'
      case 'blog_to_yuque':
        return '从博客导出更新到语雀（覆盖语雀文档）'
      case 'bidirectional':
        return '智能双向同步，自动检测并同步变更'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>同步配置</CardTitle>
            <CardDescription>选择同步方向和策略</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">同步方向</label>
                <div className="grid grid-cols-3 gap-4">
                  {([
                    { value: 'yuque_to_blog', label: '语雀 → 博客', icon: '📥' },
                    { value: 'blog_to_yuque', label: '博客 → 语雀', icon: '📤' },
                    { value: 'bidirectional', label: '双向同步', icon: '🔄' },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDirection(option.value)}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        direction === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-medium text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {getDirectionDescription(direction)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">强制覆盖</div>
                    <div className="text-sm text-gray-600">
                      覆盖目标已有内容，不跳过冲突
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={force}
                    onChange={(e) => setForce(e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  size="lg"
                  className="w-full"
                >
                  {syncing ? '创建中...' : `开始${getDirectionLabel(direction)}`}
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-2">💡 同步说明：</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• 双向同步会智能检测变更并同步到对应平台</li>
                    <li>• 已有映射的文章会被跳过（除非开启强制覆盖）</li>
                    <li>• 同步过程中可以查看实时进度和日志</li>
                    <li>• 建议先在测试环境验证后再在生产环境使用</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>同步流程</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  1
                </div>
                <div>
                  <div className="font-medium">创建同步任务</div>
                  <div className="text-sm text-gray-600 mt-1">
                    系统创建一个后台任务来处理同步操作
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  2
                </div>
                <div>
                  <div className="font-medium">获取需要同步的内容</div>
                  <div className="text-sm text-gray-600 mt-1">
                    根据同步方向获取相应的文章和文档列表
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  3
                </div>
                <div>
                  <div className="font-medium">执行同步操作</div>
                  <div className="text-sm text-gray-600 mt-1">
                    逐个处理文章，进行字段映射和内容转换
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  4
                </div>
                <div>
                  <div className="font-medium">记录同步结果</div>
                  <div className="text-sm text-gray-600 mt-1">
                    创建映射关系，记录同步日志和统计信息
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
