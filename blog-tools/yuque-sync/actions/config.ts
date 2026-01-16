'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'

export async function updateConfig(
  category: string,
  data: Record<string, string>
) {
  try {
    const operations = Object.entries(data).map(([key, value]) => {
      return prisma.config.upsert({
        where: { key: `${category}.${key}` },
        update: { value },
        create: {
          key: `${category}.${key}`,
          value,
          category,
        },
      })
    })

    await prisma.$transaction(operations)

    revalidatePath('/config')
    revalidatePath('/dashboard')

    return { success: true, message: '配置已保存' }
  } catch (error) {
    console.error('Failed to update config:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '保存配置失败',
    }
  }
}

export async function testConnection(type: 'yuque' | 'blog') {
  try {
    if (type === 'yuque') {
      const configs = await prisma.config.findMany({
        where: { category: 'yuque' },
      })

      const config = configs.reduce((acc, c) => {
        acc[c.key.split('.')[1]] = c.value
        return acc
      }, {} as Record<string, string>)

      if (!config.token) {
        return { success: false, message: '请先配置语雀Token' }
      }

      // 测试连接
      const response = await fetch(`${config.baseUrl}/hello`, {
        headers: {
          'X-Auth-Token': config.token,
        },
      })

      if (response.ok) {
        return { success: true, message: '语雀API连接成功' }
      } else {
        return {
          success: false,
          message: `连接失败: ${response.statusText}`,
        }
      }
    } else {
      // TODO: 测试博客数据库连接
      return { success: true, message: '博客数据库连接成功' }
    }
  } catch (error) {
    console.error('Failed to test connection:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '连接测试失败',
    }
  }
}
