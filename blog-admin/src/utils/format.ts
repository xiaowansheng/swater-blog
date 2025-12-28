import dayjs from 'dayjs'

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string => {
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
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const prefix = '/uploads'
  
  // 如果路径已经包含了 baseUrl + prefix，则直接返回
  if (path.startsWith(`${baseUrl}${prefix}`)) {
    return path
  }
  
  // 如果路径以 prefix 开头但没有 baseUrl，补全 baseUrl
  if (path.startsWith(prefix)) {
    return `${baseUrl}${path}`
  }

  // 否则视为纯相对路径（如 article_cover/xxx.jpg），进行拼接
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${prefix}${normalizedPath}`
}

