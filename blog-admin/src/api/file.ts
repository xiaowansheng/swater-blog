import request from './request'
import { FileMeta, PageResult } from '@/types'
import { compressImageIfNeeded } from '@/utils/imageCompress'

export const getFileList = (params: {
  page?: number
  size?: number
  keyword?: string
  fileType?: string
}): Promise<PageResult<FileMeta>> => {
  return request.get('/admin/file/list', { params })
}

export const getFileById = (id: number): Promise<FileMeta> => {
  return request.get(`/admin/file/${id}`)
}

export const uploadFile = async (file: File): Promise<FileMeta> => {
  const formData = new FormData()
  const processed = await compressImageIfNeeded(file)
  formData.append('file', processed)
  return request.post('/admin/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const uploadFileByUrl = (url: string): Promise<FileMeta> => {
  return request.post('/admin/file/upload-by-url', null, {
    params: { url },
  })
}

export const deleteFile = (id: number): Promise<void> => {
  return request.delete(`/admin/file/${id}`)
}

export const deleteBatchFile = (ids: number[]): Promise<void> => {
  return request.delete('/admin/file/batch', { data: ids })
}

/**
 * 上传外部图片URL到服务器
 * @param imageUrl 外部图片URL
 * @returns 上传后的文件元数据
 */
export const uploadExternalImage = async (
  imageUrl: string
): Promise<FileMeta> => {
  try {
    return await uploadFileByUrl(imageUrl)
  } catch (error) {
    console.error('上传外部图片失败:', error)
    throw error
  }
}

/**
 * 检查URL是否为外部图片链接
 * @param url 要检查的URL
 * @returns 是否为外部图片
 */
export const isExternalImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false

  // 排除base64
  if (url.startsWith('data:')) return false

  // 排除当前域名
  try {
    const currentOrigin = window.location.origin
    const urlOrigin = new URL(url).origin
    return urlOrigin !== currentOrigin
  } catch {
    return false
  }
}

/**
 * 检查URL是否为外部网页链接
 * @param url 要检查的URL
 * @returns 是否为外部网页链接
 */
export const isExternalWebUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false

  try {
    const urlObj = new URL(url)
    const currentOrigin = window.location.origin

    // 排除当前域名
    if (urlObj.origin === currentOrigin) return false

    // 只支持 http 和 https 协议
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') return false

    // 排除明显的文件链接（通过扩展名判断）
    const ext = urlObj.pathname.split('.').pop()?.toLowerCase()
    const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'mp4', 'avi', 'mov', 'zip', 'rar', 'tar']
    if (ext && fileExtensions.includes(ext)) return false

    return true
  } catch {
    return false
  }
}

/**
 * 抓取外部网页并保存为HTML文件
 * @param webpageUrl 外部网页URL
 * @returns 上传后的文件元数据
 */
export const uploadExternalWebpage = async (
  webpageUrl: string
): Promise<FileMeta> => {
  try {
    return await uploadFileByUrl(webpageUrl)
  } catch (error) {
    console.error('抓取外部网页失败:', error)
    throw new Error(`抓取网页失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 从文本中提取所有URL（包括图片和网页链接）
 * @param text 文本内容
 * @returns 提取到的URL数组
 */
export const extractUrls = (text: string): string[] => {
  // 匹配HTTP/HTTPS URL的正则
  const urlRegex = /(https?:\/\/[^\s\])}>"']+)/g
  const matches = text.match(urlRegex) || []
  return [...new Set(matches)] // 去重
}
