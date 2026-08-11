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
export const getFullUrl = (path: unknown): string => {
  if (typeof path !== 'string' || !path) return ''
  
  // 如果是完整 URL 或 base64，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('//')) {
    return path
  }

  const { resourcePrefix } = config
  
  // 处理以 ./ 开头的相对路径
  let normalizedPath = path;
  if (normalizedPath.startsWith('./')) {
    normalizedPath = normalizedPath.substring(1); // 移除 .
  }
  
  // 标准化路径，确保以 / 开头
  normalizedPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  
  // 如果路径已经包含了 resourcePrefix，则直接返回
  if (normalizedPath.startsWith(resourcePrefix)) {
    return normalizedPath
  }

  // 否则视为纯相对路径，拼接前缀
  return `${resourcePrefix}${normalizedPath}`
}

/**
 * 转换为相对路径 (以 ./ 开头)
 * 用于统一入库格式
 * @param path 原始路径
 */
export const toRelativeUrl = (path: unknown): string => {
  if (typeof path !== 'string' || !path) return ''
  
  // 如果是完整 URL，不处理
  if (/^(http:|https:|data:|\/\/)/i.test(path)) {
    return path
  }
  
  if (path.startsWith('./')) {
    return path
  }
  
  if (path.startsWith('/')) {
    return '.' + path
  }
  
  return './' + path
}

/**
 * 将 UTC 时间字符串转换为本地时间格式（用于管理后台回显）
 *
 * ### 转换规则
 * - 输入：UTC ISO 格式（如 "2025-01-24T16:00:00.000Z"）
 * - 输出：本地时间格式（如 "2025-01-25 00:00:00"）
 *
 * ### 示例（北京时间 UTC+8）
 * ```
 * "2025-01-24T16:00:00.000Z" → "2025-01-25 00:00:00"
 * ```
 *
 * ### 兼容性
 * - 支持纯日期格式（如 "2025-01-25"）
 * - 支持本地时间格式（如 "2025-01-25 00:00:00"）
 * - 支持标准 UTC 格式（如 "2025-01-24T16:00:00.000Z"）
 *
 * @param utcStr - UTC 时间字符串或本地时间字符串
 * @returns 本地时间格式字符串 "yyyy-MM-dd HH:mm:ss"
 */
export const convertFromUTC = (utcStr: string): string => {
  if (!utcStr) return utcStr;

  // 如果不是 UTC 格式（不带 Z），直接返回
  if (!utcStr.endsWith('Z') && !utcStr.includes('+')) {
    // 尝试解析为日期
    const date = new Date(utcStr);
    if (!isNaN(date.getTime())) {
      // 纯日期格式或本地时间格式，转换为 yyyy-MM-dd HH:mm:ss 格式
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    return utcStr;
  }

  // UTC 格式，转换为本地时间
  const date = new Date(utcStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 将本地时间字符串转换为 UTC ISO 格式（用于上传到数据库）
 *
 * ### 转换规则
 * - 输入：本地时间格式（如 "2025-01-25" 或 "2025-01-25 00:00:00"）
 * - 输出：UTC ISO 格式（如 "2025-01-24T16:00:00.000Z"）
 *
 * ### 示例（北京时间 UTC+8）
 * ```
 * "2025-01-25"           → "2025-01-24T16:00:00.000Z"
 * "2025-01-25 00:00:00"  → "2025-01-24T16:00:00.000Z"
 * ```
 *
 * ### 关键技术点
 * 纯日期格式的解析行为：
 * - `new Date("2025-01-25")` → 解析为 **UTC 时间** ❌
 * - `new Date("2025-01-25T00:00:00")` → 解析为 **本地时间** ✅
 *
 * 因此需要将纯日期格式转换为 ISO 8601 格式（添加 T00:00:00），才能正确解析为本地时间。
 *
 * ### 支持的输入格式
 * - 纯日期：`"2025-01-25"`
 * - 带时间：`"2025-01-25 00:00:00"`
 * - ISO格式：`"2025-01-25T00:00:00"`（已是 UTC）
 *
 * @param localTimeStr - 本地时间字符串
 * @returns UTC ISO 格式字符串 "yyyy-MM-ddTHH:mm:ss.sssZ"
 */
export const convertToUTC = (localTimeStr: string): string => {
  if (!localTimeStr) return localTimeStr;

  // 如果已经是 UTC 格式（带 Z），直接返回
  if (localTimeStr.endsWith('Z')) return localTimeStr;

  // 关键修复：纯日期格式需要特殊处理
  // new Date("2025-01-25") 会被解析为 UTC 时间，不是本地时间
  // new Date("2025-01-25T00:00:00") 会被解析为本地时间 ✅
  let inputToParse = localTimeStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(localTimeStr)) {
    // 纯日期格式：添加时间部分 T00:00:00，使其被解析为本地时间
    inputToParse = `${localTimeStr}T00:00:00`;
  } else if (!localTimeStr.includes('T')) {
    // 带空格的格式：2025-01-25 00:00:00 → 2025-01-25T00:00:00
    inputToParse = localTimeStr.replace(' ', 'T');
  }

  // 解析为本地时间
  const date = new Date(inputToParse);

  // 检查是否是有效日期
  if (isNaN(date.getTime())) return localTimeStr;

  // 转换为 UTC ISO 字符串
  return date.toISOString();
};
