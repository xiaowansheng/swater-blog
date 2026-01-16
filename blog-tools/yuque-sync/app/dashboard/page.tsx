import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // 获取统计信息
  const [
    totalMappings,
    recentJobs,
    todayStats,
  ] = await Promise.all([
    prisma.articleMapping.count(),
    prisma.syncJob.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.syncStats.findFirst({
      where: {
        date: new Date(),
      },
    }),
  ])

  const stats = [
    {
      title: '已映射文章',
      value: totalMappings.toString(),
      icon: '🔗',
      description: '博客与语雀的映射关系',
    },
    {
      title: '最近同步',
      value: recentJobs.filter(j => j.status === 'completed').length.toString(),
      icon: '✅',
      description: '今日完成的同步任务',
    },
    {
      title: '待处理',
      value: recentJobs.filter(j => j.status === 'pending').length.toString(),
      icon: '⏳',
      description: '等待执行的任务',
    },
    {
      title: '失败任务',
      value: recentJobs.filter(j => j.status === 'failed').length.toString(),
      icon: '❌',
      description: '需要关注的失败任务',
    },
  ]

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">仪表盘</h2>
        <p className="text-gray-600 mt-1">
          欢迎使用语雀同步工具，请先完成配置再开始使用
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span>{stat.icon}</span>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快速开始 */}
      <Card>
        <CardHeader>
          <CardTitle>快速开始</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                1
              </div>
              <div>
                <h3 className="font-medium">配置语雀API</h3>
                <p className="text-sm text-gray-600 mt-1">
                  在配置页面填写语雀Token和知识库路径
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                2
              </div>
              <div>
                <h3 className="font-medium">配置博客数据库</h3>
                <p className="text-sm text-gray-600 mt-1">
                  填写博客数据库的连接信息
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                3
              </div>
              <div>
                <h3 className="font-medium">开始同步</h3>
                <p className="text-sm text-gray-600 mt-1">
                  配置完成后即可开始导入、导出或双向同步
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近任务 */}
      <Card>
        <CardHeader>
          <CardTitle>最近任务</CardTitle>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无任务记录</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {job.jobType === 'import' && '导入'}
                      {job.jobType === 'export' && '导出'}
                      {job.jobType === 'sync' && '同步'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {job.createdAt.toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        job.status === 'completed'
                          ? 'text-green-600'
                          : job.status === 'failed'
                          ? 'text-red-600'
                          : job.status === 'running'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {job.status === 'completed' && '✓ 完成'}
                      {job.status === 'failed' && '✗ 失败'}
                      {job.status === 'running' && '⟳ 运行中'}
                      {job.status === 'pending' && '⏳ 等待'}
                      {job.status === 'cancelled' && '○ 已取消'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {job.processedItems}/{job.totalItems}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
