// Markdown 导入向导共享的类型、常量与工具函数

import type { UploadFile } from 'antd'
import { importMarkdownBatch } from '@/api/article'
import type { MarkdownImportArticlePreview, MarkdownImportConfig } from '@/api/article'
import { uploadFile } from '@/api/file'
import { generateCoverBlob, blobToFile } from '@/utils/coverGenerator'

// 单个文件的导入状态
export type FileImportStatus = 'pending' | 'generating_cover' | 'importing' | 'success' | 'failed'
export type FileImportStatusEntry = { status: FileImportStatus; message?: string; articleId?: number }

// 向导步骤配置
export interface ImportStepMeta {
  title: string
  description: string
}

export const IMPORT_STEPS: ImportStepMeta[] = [
  { title: '选择文件', description: '上传 MD 文件或文件夹' },
  { title: '导入配置', description: '设置分类和图片处理方式' },
  { title: '预览确认', description: '查看将要创建的文章和分类' },
  { title: '导入结果', description: '查看导入完成情况' },
]

// 从上传文件列表构建 (路径 -> File) 映射与有效文件列表
export const buildFileMap = (fileList: UploadFile[]) => {
  const fileMap = new Map<string, File>()
  const validFiles: File[] = []

  fileList.forEach((f) => {
    if (f.originFileObj instanceof File) {
      const file = f.originFileObj
      const path = file.webkitRelativePath || file.name
      fileMap.set(path, file)
      if (path !== file.name) fileMap.set(file.name, file)
      validFiles.push(file)
    }
  })

  return { fileMap, validFiles }
}

// 查找文件辅助函数
export const findMdFile = (filename: string, fileMap: Map<string, File>, validFiles: File[]) => {
  let mdFile = fileMap.get(filename)
  if (!mdFile) {
    mdFile = validFiles.find((f) => {
      const path = f.webkitRelativePath || f.name
      return path.endsWith(filename) || filename.endsWith(path)
    })
  }
  return mdFile
}

// 简单的路径解析函数
export const resolvePath = (basePath: string, relativePath: string): string => {
  if (relativePath.startsWith('/') || relativePath.startsWith('http')) return relativePath
  // 获取根目录 (如果是文件夹上传)
  const baseParts = basePath.split('/')
  const root = baseParts.length > 1 ? baseParts[0] : ''

  if (relativePath.startsWith('/')) {
    return root ? root + relativePath : relativePath.substring(1)
  }

  const stack = [...baseParts]
  // 移除文件名
  if (basePath.toLowerCase().endsWith('.md') || basePath.toLowerCase().endsWith('.markdown')) {
    stack.pop()
  }

  const parts = relativePath.split('/')
  for (const part of parts) {
    if (part === '.' || part === '') continue
    if (part === '..') {
      if (stack.length > (root ? 1 : 0)) stack.pop()
    } else {
      stack.push(part)
    }
  }
  return stack.join('/')
}

// 提取 Markdown 内容中的资源引用 (链接、图片、HTML src/href)
export const extractAssetRefs = (text: string): string[] => {
  const refs = new Set<string>()
  // Match Markdown links AND images: [text](url) or ![text](url)
  const mdRegex = /\[.*?\]\(([^\s)]+)(?:.*?)?\)/g
  let match
  while ((match = mdRegex.exec(text)) !== null) refs.add(match[1])

  // Match HTML src attributes (img, video, audio, source, embed, iframe script, etc.)
  const srcRegex = /src=["']([^"']+)["']/g
  while ((match = srcRegex.exec(text)) !== null) refs.add(match[1])

  // Match HTML href attributes (a, link) - useful for attachments
  const hrefRegex = /href=["']([^"']+)["']/g
  while ((match = hrefRegex.exec(text)) !== null) refs.add(match[1])

  return Array.from(refs)
}

// 根据资源引用解析出对应的本地文件，未命中时返回 undefined
export const resolveAssetFile = (
  ref: string,
  mdPath: string,
  fileMap: Map<string, File>,
  validFiles: File[],
): File | undefined => {
  // 忽略网络/内联资源以及含协议的链接
  if (ref.startsWith('http') || ref.startsWith('//') || ref.startsWith('data:') || ref.includes(':')) return undefined

  // 1. 尝试精确路径解析 (Strict Path Resolution)
  let assetFile = fileMap.get(resolvePath(mdPath, ref))

  // 2. 如果未找到，尝试文件名匹配 (Filename Fallback - Mimics Backend Strategy)
  // 后端有4种策略，其中最后一种是文件名匹配，这对于目录结构不完全匹配的情况很有用
  if (!assetFile) {
    const paths = ref.split('/')
    const refFilename = paths[paths.length - 1]?.toLowerCase()
    if (refFilename) {
      // 在所有文件中查找同名文件 (只取第一个匹配的)
      const found = validFiles.find(f => f.name.toLowerCase() === refFilename)
      if (found) assetFile = found
    }
  }

  return assetFile
}

// 单个文章导入逻辑（重试等场景复用）
export const importSingleArticle = async (
  article: MarkdownImportArticlePreview,
  config: MarkdownImportConfig,
  fileMap: Map<string, File>,
  validFiles: File[],
  setFileStatus: (filename: string, entry: FileImportStatusEntry) => void,
) => {
  const filename = article.originalFilename
  try {
    const mdFile = findMdFile(filename, fileMap, validFiles)
    if (!mdFile) {
      throw new Error(`找不到源文件: ${filename}`)
    }

    // 生成封面
    if (config.coverStrategy === 'GENERATE' && !article.cover) {
      setFileStatus(filename, { status: 'generating_cover' })
      try {
        const blob = await generateCoverBlob(article.title)
        const coverFile = blobToFile(blob, `cover-${article.slug || Date.now()}.png`)
        const uploaded = await uploadFile(coverFile)
        config.generatedCovers = { ...(config.generatedCovers || {}), [filename]: uploaded.url }
      } catch (e) {
        console.warn('生成封面失败', e)
      }
    }

    // 优化：只传递当前文件相关的配置，避免 configJson 过大导致后端报错
    // 虽然我们可能积累了很多封面 URL，但当前处理只关心这一个文件的
    const effectiveConfig = { ...config }
    // 只包含当前文件的封面映射，或者为空
    if (config.generatedCovers && config.generatedCovers[filename]) {
      effectiveConfig.generatedCovers = { [filename]: config.generatedCovers[filename] }
    } else {
      effectiveConfig.generatedCovers = {}
    }

    // 解析关联的静态资源文件
    const relatedAssets: File[] = []
    try {
      if (config.importAssets) {
        const content = await mdFile.text()
        const refs = extractAssetRefs(content)
        const mdPath = mdFile.webkitRelativePath || mdFile.name

        refs.forEach(ref => {
          const assetFile = resolveAssetFile(ref, mdPath, fileMap, validFiles)
          // 避免重复添加
          if (assetFile && !relatedAssets.includes(assetFile)) {
            relatedAssets.push(assetFile)
          }
        })
      }
    } catch (e) {
      console.warn('解析资源文件失败:', e)
    }

    // 导入
    setFileStatus(filename, { status: 'importing' })
    const batchFiles = [mdFile, ...relatedAssets]
    const result = await importMarkdownBatch(batchFiles, effectiveConfig)

    if (result.status === 'SUCCESS' || result.successCount > 0) {
      setFileStatus(filename, { status: 'success' })
      return result
    } else {
      const msg = result.warnings?.[0] || '导入失败'
      setFileStatus(filename, { status: 'failed', message: msg })
      return result
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '导入失败'
    setFileStatus(filename, { status: 'failed', message: errorMessage })
    throw error // Re-throw for caller to handle aggregation
  }
}
