import { useState } from 'react'
import {
  Card,
  Steps,
  Upload,
  Button,
  Form,
  Select,
  Radio,
  Switch,
  Input,
  Alert,
  Descriptions,
  Table,
  Tag,
  Space,
  message,
  Spin,
  Progress,
  Typography,
  Divider,
} from 'antd'
import {
  InboxOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileMarkdownOutlined,
  PictureOutlined,
  FolderOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { UploadFile, UploadProps } from 'antd'
import {
  previewMarkdownImport,
  importMarkdownBatch,
  MarkdownImportPreview,
  MarkdownImportResult,
  MarkdownImportConfig,
} from '@/api/article'
import { uploadFile } from '@/api/file'
import { generateCoverBlob, blobToFile } from '@/utils/coverGenerator'
import styles from './Import.module.scss'

const { Dragger } = Upload
const { Step } = Steps
const { Option } = Select
const { Title, Text } = Typography

const ArticleImport: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewData, setPreviewData] = useState<MarkdownImportPreview | null>(null)
  const [importResult, setImportResult] = useState<MarkdownImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [fileLoading, setFileLoading] = useState(false)
  const [savedConfig, setSavedConfig] = useState<MarkdownImportConfig | null>(null)

  // 导入状态追踪
  type FileImportStatus = 'pending' | 'generating_cover' | 'importing' | 'success' | 'failed'
  const [importStatus, setImportStatus] = useState<Record<string, { status: FileImportStatus, message?: string, articleId?: number }>>({})

  // 步骤配置
  const steps = [
    {
      title: '选择文件',
      description: '上传 MD 文件或文件夹',
    },
    {
      title: '导入配置',
      description: '设置分类和图片处理方式',
    },
    {
      title: '预览确认',
      description: '查看将要创建的文章和分类',
    },
    {
      title: '导入结果',
      description: '查看导入完成情况',
    },
  ]

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'files',
    multiple: true,
    fileList,
    // 支持常见的 Markdown 和图片格式
    accept: '.md,.markdown,.png,.jpg,.jpeg,.gif,.svg,.webp,.bmp,.ico',
    // 启用目录上传
    directory: true,
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file) => {
      // 限制文件大小（50MB）
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB')
        return Upload.LIST_IGNORE
      }

      // 过滤掉隐藏文件和不需要的文件
      const fileName = file.name
      if (fileName.startsWith('.') || fileName === 'Thumbs.db' || fileName === '.DS_Store') {
        return Upload.LIST_IGNORE
      }

      return false // 阻止自动上传
    },
    onChange: (info) => {
      // 当文件数量变化时显示加载状态
      const newCount = info.fileList.length
      const oldCount = fileList.length

      if (newCount !== oldCount && newCount > 0) {
        // 开始加载
        if (!fileLoading) {
          setFileLoading(true)
          message.loading({ content: '正在读取文件...', key: 'fileLoading', duration: 0 })
        }

        // 使用 setTimeout 让 UI 有机会更新
        setTimeout(() => {
          setFileList(info.fileList)
          setFileLoading(false)
          message.success({ content: `已加载 ${info.fileList.length} 个文件`, key: 'fileLoading', duration: 2 })
        }, 0)
      } else {
        setFileList(info.fileList)
        if (fileLoading) {
          setFileLoading(false)
          message.destroy('fileLoading')
        }
      }
    },
    customRequest: () => {
      // 阻止自动上传
    },
    // 自定义文件项渲染，显示相对路径
    itemRender: (originNode, file) => {
      const relativePath = (file.originFileObj as any)?.webkitRelativePath || file.name
      return (
        <div title={relativePath}>
          {originNode}
        </div>
      )
    },
  }

  // 预览导入
  const handlePreview = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件')
      return
    }

    setLoading(true)
    setImportProgress(0)
    setImportStatus({})
    try {
      // 在离开配置表单之前，先保存表单的值
      const values = await form.validateFields()
      const config: MarkdownImportConfig = {
        categoryMode: values.categoryMode,
        manualCategoryId: values.categoryId,
        autoCreateCategory: values.autoCreateCategory,
        assetMode: values.assetMode,
        cdnDomain: values.cdnDomain,
        basePath: '',
        defaultStatus: values.defaultStatus,
        importAssets: values.importAssets,
        duplicateResolution: values.duplicateResolution,
        coverStrategy: values.coverStrategy,
        defaultCover: values.defaultCover,
        articleType: 'post',
      }
      setSavedConfig(config)

      // 提取有效的文件对象
      const validFiles: File[] = []

      for (const file of fileList) {
        if (file.originFileObj instanceof File) {
          validFiles.push(file.originFileObj)
        }
      }

      if (validFiles.length === 0) {
        message.error('没有有效的文件，请重新选择')
        return
      }

      const basePath = values.basePath || ''
      const preview = await previewMarkdownImport(validFiles, basePath)

      setPreviewData(preview)
      setCurrentStep(2)
    } catch (error: any) {
      console.error('预览失败:', error)
      message.error(error.message || '预览失败，请检查文件格式')
    } finally {
      setLoading(false)
    }
  }

  // 查找文件辅助函数
  const findMdFile = (filename: string, fileMap: Map<string, File>, validFiles: File[]) => {
    let mdFile = fileMap.get(filename)
    if (!mdFile) {
      mdFile = validFiles.find((f) => {
        const path = (f as any).webkitRelativePath || f.name
        return path.endsWith(filename) || filename.endsWith(path)
      })
    }
    return mdFile
  }

  // 单个文章导入逻辑
  const importSingleArticle = async (
    article: any,
    config: MarkdownImportConfig,
    fileMap: Map<string, File>,
    validFiles: File[],
  ) => {
    const filename = article.originalFilename
    try {
      const mdFile = findMdFile(filename, fileMap, validFiles)
      if (!mdFile) {
        throw new Error(`找不到源文件: ${filename}`)
      }

      // 生成封面
      if (config.coverStrategy === 'GENERATE' && !article.cover) {
        setImportStatus((prev) => ({ ...prev, [filename]: { status: 'generating_cover' } }))
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
          // 简单的路径解析函数
          const resolvePath = (basePath: string, relativePath: string): string => {
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

          const extractAssetRefs = (text: string): string[] => {
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

          const content = await mdFile.text()
          const refs = extractAssetRefs(content)
          const mdPath = (mdFile as any).webkitRelativePath || mdFile.name

          refs.forEach(ref => {
            if (ref.startsWith('http') || ref.startsWith('//') || ref.startsWith('data:')) return
            // 忽略含协议的链接
            if (ref.includes(':')) return

            let assetFile: File | undefined

            // 1. 尝试精确路径解析 (Strict Path Resolution)
            const resolvedPath = resolvePath(mdPath, ref)
            assetFile = fileMap.get(resolvedPath)

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

            if (assetFile) {
              // 避免重复添加
              if (!relatedAssets.includes(assetFile)) {
                relatedAssets.push(assetFile)
              }
            }
          })
        }
      } catch (e) {
        console.warn('解析资源文件失败:', e)
      }

      // 导入
      setImportStatus((prev) => ({ ...prev, [filename]: { status: 'importing' } }))
      const batchFiles = [mdFile, ...relatedAssets]
      const result = await importMarkdownBatch(batchFiles, effectiveConfig)

      if (result.status === 'SUCCESS' || result.successCount > 0) {
        setImportStatus((prev) => ({ ...prev, [filename]: { status: 'success' } }))
        return result
      } else {
        const msg = result.warnings?.[0] || '导入失败'
        setImportStatus((prev) => ({ ...prev, [filename]: { status: 'failed', message: msg } }))
        return result
      }
    } catch (error: any) {
      setImportStatus((prev) => ({ ...prev, [filename]: { status: 'failed', message: error.message } }))
      throw error // Re-throw for caller to handle aggregation
    }
  }

  // 重试单个文章
  const handleRetry = async (article: any) => {
    if (!savedConfig) {
      message.error('配置丢失')
      return
    }

    // 重建文件映射
    const fileMap = new Map<string, File>()
    const validFiles: File[] = []
    fileList.forEach((f) => {
      if (f.originFileObj instanceof File) {
        const file = f.originFileObj
        const path = (file as any).webkitRelativePath || file.name
        fileMap.set(path, file)
        if (path !== file.name) fileMap.set(file.name, file)
        validFiles.push(file)
      }
    })

    try {
      await importSingleArticle(article, { ...savedConfig }, fileMap, validFiles)
      message.success('重试成功')
    } catch (e) {
      message.error('重试失败')
    }
  }

  // 开始导入
  const handleImport = async () => {
    if (!savedConfig || !previewData) {
      message.error('配置或预览数据丢失，请重试')
      return
    }

    setImportProgress(0)

    // 初始化状态 (仅对未成功的)
    const initialStatus: Record<string, any> = { ...importStatus }
    previewData.articles.forEach((a) => {
      // 如果之前的状态不是成功，重置为 pending
      if (initialStatus[a.originalFilename]?.status !== 'success') {
        initialStatus[a.originalFilename] = { status: 'pending' }
      }
    })
    setImportStatus(initialStatus)

    // 构建文件查找 Map
    const fileMap = new Map<string, File>()
    const validFiles: File[] = []

    fileList.forEach((f) => {
      if (f.originFileObj instanceof File) {
        const file = f.originFileObj
        const path = (file as any).webkitRelativePath || file.name
        fileMap.set(path, file)
        if (path !== file.name) {
          fileMap.set(file.name, file)
        }
        validFiles.push(file)
      }
    })

    // aggregatedResult removed (unused)
    const resolvePath = (basePath: string, relativePath: string): string => {
      if (relativePath.startsWith('/') || relativePath.startsWith('http')) return relativePath
      const baseParts = basePath.split('/')
      const root = baseParts.length > 1 ? baseParts[0] : ''

      if (relativePath.startsWith('/')) {
        return root ? root + relativePath : relativePath.substring(1)
      }
      const stack = [...baseParts]
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

    const extractAssetRefs = (text: string): string[] => {
      const refs = new Set<string>()
      // Match Markdown links AND images
      const mdRegex = /\[.*?\]\(([^\s)]+)(?:.*?)?\)/g
      let match
      while ((match = mdRegex.exec(text)) !== null) refs.add(match[1])

      const srcRegex = /src=["']([^"']+)["']/g
      while ((match = srcRegex.exec(text)) !== null) refs.add(match[1])

      const hrefRegex = /href=["']([^"']+)["']/g
      while ((match = hrefRegex.exec(text)) !== null) refs.add(match[1])

      return Array.from(refs)
    }

    // 过滤出需要导入的文章（排除已成功的）
    const articlesToImport = previewData.articles.filter(a => importStatus[a.originalFilename]?.status !== 'success')
    const totalCount = previewData.articles.length
    let processedCount = totalCount - articlesToImport.length

    // 分批处理 (Batch Size = 5)
    // 如果没有需要处理的，直接完成
    if (articlesToImport.length === 0) {
      setImportProgress(100)
      message.success('没有需要处理的文章')
      return
    }

    const BATCH_SIZE = 1
    for (let i = 0; i < articlesToImport.length; i += BATCH_SIZE) {
      const batchArticles = articlesToImport.slice(i, i + BATCH_SIZE)

      // 1. 找到对应的 MD 文件
      const batchMdFiles: File[] = []
      batchArticles.forEach(a => {
        const f = fileMap.get(a.originalFilename)
        if (f) {
          batchMdFiles.push(f)
          setImportStatus(prev => ({ ...prev, [a.originalFilename]: { status: 'importing' } }))
        } else {
          setImportStatus(prev => ({ ...prev, [a.originalFilename]: { status: 'failed', message: '文件丢失' } }))
        }
      })

      if (batchMdFiles.length === 0) continue

      // 2. 准备当前批次的配置和资源
      try {
        const batchConfig = { ...savedConfig }
        batchConfig.generatedCovers = {}

        // 复制已有的封面配置
        batchArticles.forEach(a => {
          if (savedConfig.generatedCovers?.[a.originalFilename]) {
            batchConfig.generatedCovers![a.originalFilename] = savedConfig.generatedCovers[a.originalFilename]
          }
        })

        // 自动生成封面 (如果策略是 GENERATE 且文章没有封面)
        if (savedConfig.coverStrategy === 'GENERATE') {
          for (const article of batchArticles) {
            // 如果 frontmatter 没指定封面，且还没有生成的封面URL
            if (!article.cover && !batchConfig.generatedCovers?.[article.originalFilename]) {
              try {
                setImportStatus(prev => ({ ...prev, [article.originalFilename]: { status: 'generating_cover' } }))

                // 生成封面 Blob
                const blob = await generateCoverBlob(article.title)

                // 上传封面
                const timestamp = Date.now()
                const slug = article.slug || `article-${timestamp}`
                const coverFile = blobToFile(blob, `cover-${slug}.png`)
                const uploaded = await uploadFile(coverFile)

                // 更新配置
                if (!batchConfig.generatedCovers) {
                  batchConfig.generatedCovers = {}
                }
                batchConfig.generatedCovers[article.originalFilename] = uploaded.url

                // 恢复状态为 importing
                setImportStatus(prev => ({ ...prev, [article.originalFilename]: { status: 'importing' } }))
              } catch (e) {
                console.warn('Cover generation failed for', article.originalFilename, e)
                // 不中断流程，只是没封面。状态重置为 importing 以便继续
                setImportStatus(prev => ({ ...prev, [article.originalFilename]: { status: 'importing' } }))
              }
            }
          }
        }

        const batchAssets: File[] = []
        const processedAssets = new Set<string>()

        if (savedConfig.importAssets) {
          for (const mdFile of batchMdFiles) {
            try {
              const content = await mdFile.text()
              const refs = extractAssetRefs(content)
              const mdPath = (mdFile as any).webkitRelativePath || mdFile.name

              refs.forEach(ref => {
                if (ref.startsWith('http') || ref.startsWith('//') || ref.startsWith('data:') || ref.includes(':')) return

                let assetFile: File | undefined
                const resolvedPath = resolvePath(mdPath, ref)
                assetFile = fileMap.get(resolvedPath)

                if (!assetFile) {
                  const paths = ref.split('/')
                  const refFilename = paths[paths.length - 1]?.toLowerCase()
                  if (refFilename) {
                    const found = validFiles.find(f => f.name.toLowerCase() === refFilename)
                    if (found) assetFile = found
                  }
                }

                if (assetFile) {
                  const assetKey = (assetFile as any).webkitRelativePath || assetFile.name
                  if (!processedAssets.has(assetKey)) {
                    processedAssets.add(assetKey)
                    batchAssets.push(assetFile)
                  }
                }
              })
            } catch (e) {
              console.warn('Asset Parse Error', e)
            }
          }
        }

        // 3. 调用 API
        const result = await importMarkdownBatch([...batchMdFiles, ...batchAssets], batchConfig)

        // 4. 更新结果状态
        setImportStatus(prev => {
          const next = { ...prev }
          result.articles.forEach(a => {
            next[a.originalFilename] = { status: 'success' }
          })
          result.errors.forEach(e => {
            next[e.filename] = { status: 'failed', message: e.message }
          })
          batchArticles.forEach(a => {
            if (next[a.originalFilename]?.status === 'importing') {
              if (next[a.originalFilename].status !== 'success') {
                next[a.originalFilename] = { status: 'failed', message: '未知错误' }
              }
            }
          })
          return next
        })

      } catch (error: any) {
        console.error('Batch Request Failed', error)
        setImportStatus(prev => {
          const next = { ...prev }
          batchArticles.forEach(a => {
            if (next[a.originalFilename]?.status === 'importing') {
              next[a.originalFilename] = { status: 'failed', message: error.message || '请求失败' }
            }
          })
          return next
        })
      }

      processedCount += batchArticles.length
      setImportProgress(Math.min(100, Math.round((processedCount / totalCount) * 100)))
    }

    setLoading(false)
    message.success('处理完成')
  }

  // 渲染第一步：文件选择
  const renderFileSelection = () => {
    // 统计目录信息
    const directories = new Set<string>()
    fileList.forEach((file) => {
      const relativePath = (file.originFileObj as any)?.webkitRelativePath || ''
      if (relativePath) {
        const parts = relativePath.split('/')
        if (parts.length > 1) {
          // 收集第一级目录（根目录后的第一个目录）
          directories.add(parts[0])
        }
      }
    })

    return (
      <div className={styles.fileSelection}>
        <Card title="上传文件夹" bordered={false}>
          <Alert
            message="上传说明"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>点击选择一个包含 Markdown 文件的<strong>文件夹</strong></li>
                <li>文件夹中的目录结构会被保留，用于自动创建分类</li>
                <li>支持的文件格式：.md, .markdown 以及常见图片格式</li>
                <li>资源文件（图片）会自动关联到相应的文章</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Spin spinning={fileLoading} tip="正在读取文件...">
            <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击选择文件夹，或将文件夹拖拽到此区域</p>
              <p className="ant-upload-hint">
                将自动读取文件夹中的所有 Markdown 文件和资源文件
              </p>
            </Dragger>
          </Spin>

          <div className={styles.fileStats}>
            <Space size="large" wrap>
              <Text>
                <FileMarkdownOutlined /> MD 文件: {fileList.filter((f) => f.name.endsWith('.md') || f.name.endsWith('.markdown')).length} 个
              </Text>
              <Text>
                <PictureOutlined /> 资源文件: {fileList.filter((f) => !f.name.endsWith('.md') && !f.name.endsWith('.markdown')).length} 个
              </Text>
              {directories.size > 0 && (
                <Text>
                  <FolderOutlined /> 目录: {directories.size} 个
                </Text>
              )}
              {fileList.length > 0 && (
                <Button
                  size="small"
                  danger
                  onClick={() => setFileList([])}
                >
                  清空文件
                </Button>
              )}
            </Space>
          </div>

          <Divider />

          <Space>
            <Button
              type="primary"
              onClick={() => {
                setCurrentStep(1)
              }}
              disabled={fileList.length === 0}
              loading={loading}
            >
              下一步：配置导入 {fileList.length > 0 && `(${fileList.length} 个文件)`}
            </Button>
            <Button onClick={() => {
              console.log('当前 fileList:', fileList)
              navigate('/article')
            }}>
              取消
            </Button>
          </Space>
        </Card>
      </div>
    )
  }

  // 渲染第二步：导入配置
  const renderImportConfig = () => (
    <div className={styles.importConfig}>
      <Card title="导入配置" bordered={false}>
        <Form form={form} layout="vertical" initialValues={{
          categoryMode: 'AUTO',
          autoCreateCategory: true,
          assetMode: 'RELATIVE_PATH',
          importAssets: true,
          defaultStatus: 'DRAFT',
          duplicateResolution: 'SKIP',
          coverStrategy: 'GENERATE',
        }}>
          <Title level={5}>分类映射规则</Title>
          <Form.Item label="分类模式" name="categoryMode" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="AUTO">自动创建分类（目录名 → 分类）</Radio>
              <Radio value="MANUAL">全部指定到同一分类</Radio>
              <Radio value="FRONTMATTER">仅使用 frontmatter 中的分类</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.categoryMode !== currentValues.categoryMode}>
            {({ getFieldValue }) => {
              const categoryMode = getFieldValue('categoryMode')
              if (categoryMode === 'MANUAL') {
                return (
                  <Form.Item label="选择分类" name="categoryId">
                    <Select placeholder="请选择分类" allowClear>
                      <Option value={1}>技术</Option>
                      <Option value={2}>生活</Option>
                      {/* TODO: 从后端加载分类列表 */}
                    </Select>
                  </Form.Item>
                )
              }
              return null
            }}
          </Form.Item>

          <Form.Item label="自动创建不存在的分类" name="autoCreateCategory" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Divider />

          <Title level={5}>静态文件处理</Title>
          <Form.Item label="导入图片等资源文件" name="importAssets" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.importAssets !== currentValues.importAssets}>
            {({ getFieldValue }) => {
              const importAssets = getFieldValue('importAssets')
              if (!importAssets) return null

              return (
                <>
                  <Form.Item label="图片引用方式" name="assetMode" rules={[{ required: true }]}>
                    <Radio.Group>
                      <Radio value="ABSOLUTE_URL">替换为 CDN URL</Radio>
                      <Radio value="RELATIVE_PATH">保留相对路径</Radio>
                      <Radio value="BASE64">转换为 Base64（小图片）</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.assetMode !== currentValues.assetMode}>
                    {({ getFieldValue }) => {
                      const assetMode = getFieldValue('assetMode')
                      if (assetMode === 'ABSOLUTE_URL') {
                        return (
                          <Form.Item label="CDN 域名" name="cdnDomain" extra="例如: https://cdn.yourdomain.com">
                            <Input placeholder="输入 CDN 域名（可选）" />
                          </Form.Item>
                        )
                      }
                      return null
                    }}
                  </Form.Item>
                </>
              )
            }}
          </Form.Item>

          <Form.Item
            label="封面生成策略"
            name="coverStrategy"
            tooltip="当 Frontmatter 中没有指定封面时，如何生成封面"
          >
            <Radio.Group>
              <Radio value="FIRST_IMAGE">使用第一张图片</Radio>
              <Radio value="GENERATE">随机生成封面</Radio>
              <Radio value="DEFAULT">使用默认封面</Radio>
              <Radio value="NONE">不处理 (为空)</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.coverStrategy !== currentValues.coverStrategy}>
            {({ getFieldValue }) => {
              const coverStrategy = getFieldValue('coverStrategy')
              if (coverStrategy === 'DEFAULT') {
                return (
                  <Form.Item
                    label="默认封面 URL"
                    name="defaultCover"
                    rules={[{ required: true, message: '请输入默认封面 URL' }]}
                  >
                    <Input placeholder="例如: https://example.com/cover.jpg" />
                  </Form.Item>
                )
              }
              return null
            }}
          </Form.Item>

          <Divider />

          <Title level={5}>文章状态</Title>
          <Form.Item label="默认状态" name="defaultStatus" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="DRAFT">草稿</Radio>
              <Radio value="PUBLISHED">直接发布</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="重复文章处理"
            name="duplicateResolution"
            rules={[{ required: true }]}
            tooltip="当文章 Slug (URL路径) 重复时的处理方式"
          >
            <Radio.Group>
              <Radio value="SKIP">跳过 (默认)</Radio>
              <Radio value="OVERWRITE">覆盖更新</Radio>
              <Radio value="RENAME">自动重命名</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>

        <Divider />

        <Space>
          <Button onClick={() => setCurrentStep(0)}>上一步</Button>
          <Button type="primary" onClick={handlePreview} loading={loading}>
            预览导入
          </Button>
        </Space>
      </Card>
    </div>
  )

  // 渲染第三步：预览确认
  const renderPreview = () => {
    if (!previewData) return null

    const categoryColumns = [
      { title: '分类名称', dataIndex: 'name', key: 'name' },
      { title: '分类 Key', dataIndex: 'categoryKey', key: 'categoryKey' },
      { title: '层级', dataIndex: 'level', key: 'level', render: (level: number) => `Level ${level}` },
      { title: '文章数量', dataIndex: 'articleCount', key: 'articleCount' },
      {
        title: '状态',
        key: 'status',
        render: (_: any, record: any) => (
          <Space>
            {record.exists && <Tag color="blue">已存在</Tag>}
            {record.willCreate && <Tag color="green">将创建</Tag>}
          </Space>
        ),
      },
    ]

    const articleColumns = [
      { title: '文件名', dataIndex: 'originalFilename', key: 'originalFilename', width: 200 },
      { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
      { title: '分类', dataIndex: 'category', key: 'category' },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags: string[]) => tags?.map((tag) => <Tag key={tag}>{tag}</Tag>),
      },
      {
        title: 'Frontmatter',
        dataIndex: 'hasFrontmatter',
        key: 'hasFrontmatter',
        render: (hasFrontmatter: boolean) => (hasFrontmatter ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
      },
      {
        title: '图片',
        dataIndex: 'imageCount',
        key: 'imageCount',
        render: (count: number) => (count > 0 ? <Tag icon={<PictureOutlined />}>{count}</Tag> : '-'),
      },
      {
        title: '状态',
        dataIndex: 'isDraft',
        key: 'isDraft',
        render: (isDraft: boolean) => (isDraft ? <Tag color="orange">草稿</Tag> : <Tag color="green">发布</Tag>),
      },
      {
        title: '导入进度',
        key: 'importStatus',
        width: 150,
        filters: [
          { text: '未开始', value: 'pending' },
          { text: '成功', value: 'success' },
          { text: '失败', value: 'failed' },
          { text: '进行中', value: 'processing' },
        ],
        onFilter: (value: any, record: any) => {
          const s = importStatus[record.originalFilename]?.status || 'pending'
          if (value === 'processing') {
            return s === 'generating_cover' || s === 'importing'
          }
          return s === value
        },
        render: (_: any, record: any) => {
          const status = importStatus[record.originalFilename]
          if (!status) return <Tag>等待中</Tag>

          switch (status.status) {
            case 'pending': return <Tag>等待中</Tag>
            case 'generating_cover': return <Tag color="blue" icon={<PictureOutlined spin />}>生成封面</Tag>
            case 'importing': return <Tag color="processing" icon={<InboxOutlined spin />}>导入中</Tag>
            case 'success': return <Tag color="success" icon={<CheckCircleOutlined />}>成功</Tag>
            case 'failed':
              return (
                <Space direction="vertical" size={0}>
                  <Tag color="error" icon={<CloseCircleOutlined />}>{status.message || '失败'}</Tag>
                </Space>
              )
            default: return <Tag>未知</Tag>
          }
        }
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right' as const,
        width: 100,
        render: (_: any, record: any) => {
          const status = importStatus[record.originalFilename]
          if (status?.status === 'failed') {
            return <Button type="link" size="small" onClick={() => handleRetry(record)}>重试</Button>
          }
          return null
        }
      },
    ]

    return (
      <div className={styles.preview}>
        <Card title="导入预览" bordered={false}>
          <Alert
            message={`将创建 ${previewData.articleCount} 篇文章，${previewData.categoryCount} 个分类`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {(importProgress > 0 || loading) && (
            <div style={{ marginBottom: 16 }}>
              {(() => {
                const total = previewData.articles.length
                const statuses = Object.values(importStatus)
                const success = statuses.filter((s) => s.status === 'success').length
                const failed = statuses.filter((s) => s.status === 'failed').length
                const processed = success + failed
                // 进度条至少显示 1% 如果正在处理，或者基于实际计算
                const percent = Math.max(importProgress, Math.round((processed / total) * 100))

                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space>
                        <span>当前进度: {processed} / {total}</span>
                        {success > 0 && <Tag color="success">成功: {success}</Tag>}
                        {failed > 0 && <Tag color="error">失败: {failed}</Tag>}
                      </Space>
                      <span>{percent}%</span>
                    </div>
                    <Progress
                      percent={percent}
                      status={loading ? 'active' : failed > 0 ? 'exception' : 'success'}
                      showInfo={false}
                    />
                  </>
                )
              })()}
            </div>
          )}

          <Descriptions bordered size="small" column={3} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="MD 文件">{previewData.mdFileCount} 个</Descriptions.Item>
            <Descriptions.Item label="资源文件">{previewData.assetFileCount} 个</Descriptions.Item>
            <Descriptions.Item label="总文件">{previewData.totalFileCount} 个</Descriptions.Item>
          </Descriptions>

          {previewData.categories.length > 0 && (
            <>
              <Title level={5}>分类预览</Title>
              <Table
                columns={categoryColumns}
                dataSource={previewData.categories}
                rowKey="categoryKey"
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
              />
            </>
          )}

          <Title level={5}>文章预览</Title>
          <Table
            columns={articleColumns}
            dataSource={previewData.articles}
            rowKey="originalFilename"
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 1000 }}
          />

          <Divider />

          <Space>
            <Button onClick={() => setCurrentStep(1)} disabled={loading || (importProgress > 0 && importProgress < 100)}>上一步</Button>
            <Button
              type="primary"
              onClick={handleImport}
              loading={loading}
              disabled={importProgress > 0 && importProgress < 100}
            >
              {importProgress > 0 && importProgress < 100 ? '导入中...' : (importResult ? '重试全部失败任务' : '开始导入')}
            </Button>
            <Button onClick={() => setCurrentStep(3)} disabled={!importResult}>
              完成/查看结果
            </Button>
          </Space>
        </Card>
      </div>
    )
  }

  // 渲染第四步：导入结果
  const renderResult = () => {
    if (!importResult) return null

    const isSuccess = importResult.status === 'SUCCESS'
    const isPartialSuccess = importResult.status === 'PARTIAL_SUCCESS'

    return (
      <div className={styles.result}>
        <Card bordered={false}>
          <div className={styles.resultHeader}>
            {isSuccess && <CheckCircleOutlined className={styles.successIcon} />}
            {(isPartialSuccess || importResult.status === 'FAILED') && (
              <CloseCircleOutlined className={styles.errorIcon} />
            )}
            <Title level={3}>
              {isSuccess && '导入成功！'}
              {isPartialSuccess && '部分成功'}
              {importResult.status === 'FAILED' && '导入失败'}
            </Title>
          </div>

          <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="成功">{importResult.successCount} 篇</Descriptions.Item>
            <Descriptions.Item label="失败">{importResult.failedCount} 篇</Descriptions.Item>
            <Descriptions.Item label="跳过">{importResult.skippedCount} 篇</Descriptions.Item>
            <Descriptions.Item label="创建分类">{importResult.createdCategoryCount} 个</Descriptions.Item>
            <Descriptions.Item label="导入资源">{importResult.importedAssetCount} 个</Descriptions.Item>
            <Descriptions.Item label="耗时">{(importResult.duration / 1000).toFixed(2)} 秒</Descriptions.Item>
          </Descriptions>

          {importProgress > 0 && importProgress < 100 && (
            <Progress percent={importProgress} status="active" style={{ marginBottom: 16 }} />
          )}

          {importResult.articles.length > 0 && (
            <>
              <Title level={5}>成功导入的文章</Title>
              <Table
                columns={[
                  { title: '文件名', dataIndex: 'originalFilename', key: 'originalFilename' },
                  { title: '标题', dataIndex: 'title', key: 'title' },
                  { title: '分类', dataIndex: 'categoryName', key: 'categoryName' },
                  { title: '状态', dataIndex: 'status', key: 'status' },
                ]}
                dataSource={importResult.articles}
                rowKey="articleId"
                pagination={{ pageSize: 5 }}
                size="small"
                style={{ marginBottom: 16 }}
              />
            </>
          )}

          {importResult.errors.length > 0 && (
            <>
              <Title level={5}>错误信息</Title>
              {importResult.errors.map((error, index) => (
                <Alert
                  key={index}
                  message={`${error.filename}: ${error.message}`}
                  type="error"
                  closable
                  style={{ marginBottom: 8 }}
                />
              ))}
            </>
          )}

          <Divider />

          <Space>
            <Button type="primary" onClick={() => navigate('/article')}>
              返回文章列表
            </Button>
            <Button onClick={() => {
              setCurrentStep(0)
              setFileList([])
              setPreviewData(null)
              setImportResult(null)
              setImportProgress(0)
              setImportStatus({})
            }}>
              继续导入
            </Button>
          </Space>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/article')}>
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          导入 Markdown 文档
        </Title>
      </div>

      <Card bordered={false}>
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        <Spin spinning={loading && currentStep !== 3} tip="处理中...">
          {currentStep === 0 && renderFileSelection()}
          {currentStep === 1 && renderImportConfig()}
          {currentStep === 2 && renderPreview()}
          {currentStep === 3 && renderResult()}
        </Spin>
      </Card>
    </div>
  )
}

export default ArticleImport
