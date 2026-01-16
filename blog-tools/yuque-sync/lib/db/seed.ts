import { prisma } from './prisma'

export async function seed() {
  console.log('🌱 开始初始化数据库...')

  // 创建默认配置
  const configs = [
    // 语雀配置
    { key: 'yuque.token', value: '', category: 'yuque' },
    { key: 'yuque.baseUrl', value: 'https://www.yuque.com/api/v2', category: 'yuque' },
    { key: 'yuque.namespace', value: '', category: 'yuque' },

    // 博客数据库配置
    { key: 'blog.type', value: 'mysql', category: 'blog' },
    { key: 'blog.host', value: 'localhost', category: 'blog' },
    { key: 'blog.port', value: '3306', category: 'blog' },
    { key: 'blog.database', value: 'blog', category: 'blog' },
    { key: 'blog.username', value: 'root', category: 'blog' },
    { key: 'blog.password', value: '', category: 'blog' },

    // 同步配置
    { key: 'sync.format', value: 'markdown', category: 'sync' },
    { key: 'sync.conflictStrategy', value: 'skip', category: 'sync' },
    { key: 'sync.autoPublish', value: 'false', category: 'sync' },
    { key: 'sync.batchSize', value: '10', category: 'sync' },
    { key: 'sync.delayBetweenRequests', value: '1000', category: 'sync' },
  ]

  for (const config of configs) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }

  console.log('✅ 配置初始化完成')
  console.log('💡 请在Web界面配置语雀Token和博客数据库信息')
}

// 运行seed
seed()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
