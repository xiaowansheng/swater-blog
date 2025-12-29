import dayjs from 'dayjs'
import config from '@/config'

export const formatDate = (date: string | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 转换文件路径为完整可访问 URL
 * @param path 相对路径或绝对路径
 * @returns 完整 URL
 */
export const getFullUrl = (path: string | undefined): string => {
  if (!path) return ''
  
  // 如果是完整 URL 或 base64，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }

  const { resourcePrefix } = config
  
  // 标准化路径，确保以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  
  // 如果路径已经包含了 resourcePrefix，则直接返回
  if (normalizedPath.startsWith(resourcePrefix)) {
    return normalizedPath
  }

  // 否则视为纯相对路径，拼接前缀
  return `${resourcePrefix}${normalizedPath}`
}

