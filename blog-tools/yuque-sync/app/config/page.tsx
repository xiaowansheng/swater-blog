import { ConfigForm } from '@/components/config/ConfigForm'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

async function getConfig(category: string) {
  const configs = await prisma.config.findMany({
    where: { category },
  })

  return configs.reduce((acc, config) => {
    const key = config.key.split('.')[1]
    acc[key] = config.value
    return acc
  }, {} as Record<string, string>)
}

export default async function ConfigPage() {
  const [yuqueConfig, blogConfig, syncConfig] = await Promise.all([
    getConfig('yuque'),
    getConfig('blog'),
    getConfig('sync'),
  ])

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">配置管理</h2>
        <p className="text-gray-600 mt-1">
          配置语雀API、博客数据库和同步选项
        </p>
      </div>

      {/* 配置表单 */}
      <div className="space-y-6">
        <ConfigForm
          title="语雀配置"
          description="配置语雀API访问信息"
          category="yuque"
          initialValues={yuqueConfig}
          fields={[
            {
              name: 'token',
              label: 'API Token',
              type: 'password',
              required: true,
              placeholder: '请输入语雀API Token',
              description: (
                <a
                  href="https://www.yuque.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  点击获取Token →
                </a>
              ),
            },
            {
              name: 'baseUrl',
              label: 'Base URL',
              type: 'text',
              required: true,
              placeholder: 'https://www.yuque.com/api/v2',
            },
            {
              name: 'namespace',
              label: '知识库路径',
              type: 'text',
              required: true,
              placeholder: 'group/repo',
              description: '格式：团队/知识库，例如：myteam/blog',
            },
          ]}
        />

        <ConfigForm
          title="博客数据库配置"
          description="配置博客数据库连接信息"
          category="blog"
          initialValues={blogConfig}
          fields={[
            {
              name: 'type',
              label: '数据库类型',
              type: 'select',
              options: [
                { value: 'mysql', label: 'MySQL' },
                { value: 'postgresql', label: 'PostgreSQL' },
              ],
            },
            {
              name: 'host',
              label: '主机地址',
              type: 'text',
              placeholder: 'localhost',
            },
            {
              name: 'port',
              label: '端口',
              type: 'number',
              placeholder: '3306',
            },
            {
              name: 'database',
              label: '数据库名',
              type: 'text',
              placeholder: 'blog',
            },
            {
              name: 'username',
              label: '用户名',
              type: 'text',
              placeholder: 'root',
            },
            {
              name: 'password',
              label: '密码',
              type: 'password',
            },
          ]}
        />

        <ConfigForm
          title="同步配置"
          description="配置同步行为和策略"
          category="sync"
          initialValues={syncConfig}
          fields={[
            {
              name: 'format',
              label: '内容格式',
              type: 'select',
              options: [
                { value: 'markdown', label: 'Markdown' },
                { value: 'html', label: 'HTML' },
                { value: 'lake', label: 'Lake (语雀格式)' },
              ],
            },
            {
              name: 'conflictStrategy',
              label: '冲突处理策略',
              type: 'select',
              options: [
                { value: 'skip', label: '跳过冲突' },
                { value: 'overwrite', label: '强制覆盖' },
                { value: 'merge', label: '智能合并' },
                { value: 'ask', label: '交互式询问' },
              ],
            },
            {
              name: 'autoPublish',
              label: '自动发布',
              type: 'checkbox',
              description: '导入时自动将文章设置为发布状态',
            },
            {
              name: 'batchSize',
              label: '批量大小',
              type: 'number',
              description: '每次同步处理的文档数量',
            },
            {
              name: 'delayBetweenRequests',
              label: '请求延迟（毫秒）',
              type: 'number',
              description: '避免API限流，两次请求之间的延迟',
            },
          ]}
        />
      </div>
    </div>
  )
}
