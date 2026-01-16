'use server'

import { prisma } from '@/lib/db/prisma'
import { YuqueClient } from '@/lib/yuque/client'
import { BlogClient } from '@/lib/blog/client'

export async function getConfig() {
  try {
    const configs = await prisma.config.findMany()
    const configMap: Record<string, any> = {}

    configs.forEach((config) => {
      configMap[config.key] = config.value
    })

    return {
      success: true,
      data: configMap,
    }
  } catch (error) {
    console.error('Failed to get config:', error)
    return {
      success: false,
      data: {},
      message: '获取配置失败',
    }
  }
}

export async function updateConfig(configData: Record<string, string>) {
  try {
    // 批量更新配置
    for (const [key, value] of Object.entries(configData)) {
      await prisma.config.upsert({
        where: { key },
        update: { value },
        create: {
          key,
          value,
          category: key.startsWith('yuque_')
            ? 'yuque'
            : key.startsWith('db_')
              ? 'blog'
              : 'sync',
        },
      })
    }

    return {
      success: true,
      message: '配置保存成功',
    }
  } catch (error) {
    console.error('Failed to update config:', error)
    return {
      success: false,
      message: '保存配置失败',
    }
  }
}

export async function testConnection(type: 'yuque' | 'blog') {
  try {
    const config = await getConfig()

    if (!config.success) {
      return {
        success: false,
        message: '获取配置失败',
      }
    }

    if (type === 'yuque') {
      // 测试语雀连接
      const client = new YuqueClient({
        token: config.data.yuque_token || '',
        namespace: config.data.yuque_namespace || '',
      })

      await client.testConnection()
      return {
        success: true,
        message: '语雀连接成功',
      }
    } else {
      // 测试博客数据库连接
      const client = new BlogClient({
        host: config.data.db_host || 'localhost',
        port: parseInt(config.data.db_port || '3306'),
        user: config.data.db_user || 'root',
        password: config.data.db_password || '',
        database: config.data.db_name || '',
      })

      await client.testConnection()
      return {
        success: true,
        message: '数据库连接成功',
      }
    }
  } catch (error: any) {
    console.error('Connection test failed:', error)
    return {
      success: false,
      message: error.message || '连接失败',
    }
  }
}
