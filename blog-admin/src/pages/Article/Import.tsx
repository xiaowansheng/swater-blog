import { useState } from 'react'
import {
  Button,
  Card,
  Form,
  Steps,
  Spin,
  Typography,
  message,
} from 'antd'
import type { UploadFile } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { previewMarkdownImport, importMarkdownBatch } from '@/api/article'
import type {
  MarkdownImportArticlePreview,
  MarkdownImportConfig,
  MarkdownImportPreview,
  MarkdownImportResult,
} from '@/api/article'
import { uploadFile } from '@/api/file'
import { generateCoverBlob, blobToFile } from '@/utils/coverGenerator'
import FileSelectionStep from './import/FileSelectionStep'
import ImportConfigStep from './import/ImportConfigStep'
import PreviewStep from './import/PreviewStep'
import ResultStep from './import/ResultStep'
import {
  IMPORT_STEPS,
  buildFileMap,
  importSingleArticle,
  extractAssetRefs,
  resolveAssetFile,
} from './import/shared'
import type { FileImportStatusEntry } from './import/shared'

const { Step } = Steps
const { Title } = Typography

// 导入 Markdown 文档向导：本文件只负责步骤状态机与数据流编排，
// 各步骤 UI 与共享工具逻辑见 ./import/ 目录。
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
  const [importStatus, setImportStatus] = useState<Record<string, FileImportStatusEntry>>({})

  // 更新单个文件的导入状态
  const setFileStatus = (filename: string, entry: FileImportStatusEntry) => {
    setImportStatus((prev) => ({ ...prev, [filename]: entry }))
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
    } catch (error) {
      console.error('预览失败:', error)
      message.error(error instanceof Error ? error.message || '预览失败，请检查文件格式' : '预览失败，请检查文件格式')
    } finally {
      setLoading(false)
    }
  }

  // 重试单个文章
  const handleRetry = async (article: MarkdownImportArticlePreview) => {
    if (!savedConfig) {
      message.error('配置丢失')
      return
    }

    // 重建文件映射
    const { fileMap, validFiles } = buildFileMap(fileList)

    try {
      await importSingleArticle(article, { ...savedConfig }, fileMap, validFiles, setFileStatus)
      message.success('重试成功')
    } catch {
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
    const initialStatus: Record<string, FileImportStatusEntry> = { ...importStatus }
    previewData.articles.forEach((a) => {
      // 如果之前的状态不是成功，重置为 pending
      if (initialStatus[a.originalFilename]?.status !== 'success') {
        initialStatus[a.originalFilename] = { status: 'pending' }
      }
    })
    setImportStatus(initialStatus)

    // 构建文件查找 Map
    const { fileMap, validFiles } = buildFileMap(fileList)

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
              const mdPath = mdFile.webkitRelativePath || mdFile.name

              refs.forEach(ref => {
                const assetFile = resolveAssetFile(ref, mdPath, fileMap, validFiles)
                if (assetFile) {
                  const assetKey = assetFile.webkitRelativePath || assetFile.name
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

      } catch (error) {
        console.error('Batch Request Failed', error)
        setImportStatus(prev => {
          const next = { ...prev }
          batchArticles.forEach(a => {
            if (next[a.originalFilename]?.status === 'importing') {
              next[a.originalFilename] = { status: 'failed', message: error instanceof Error ? error.message || '请求失败' : '请求失败' }
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

  // 继续导入：重置全部状态回到第一步
  const handleRestart = () => {
    setCurrentStep(0)
    setFileList([])
    setPreviewData(null)
    setImportResult(null)
    setImportProgress(0)
    setImportStatus({})
  }

  return (
    // 原 scss 中 .container / .header 的等价 Tailwind 写法
    <div className="p-6 bg-[#f0f2f5] min-h-[calc(100vh_-_64px)]">
      <div className="flex items-center gap-4 mb-6 bg-white px-6 py-4 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/article')}>
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          导入 Markdown 文档
        </Title>
      </div>

      <Card bordered={false}>
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {IMPORT_STEPS.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        <Spin spinning={loading && currentStep !== 3} tip="处理中...">
          {currentStep === 0 && (
            <FileSelectionStep
              fileList={fileList}
              fileLoading={fileLoading}
              loading={loading}
              onFileListChange={setFileList}
              onFileLoadingChange={setFileLoading}
              onNext={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 1 && (
            <ImportConfigStep
              form={form}
              loading={loading}
              onPrev={() => setCurrentStep(0)}
              onPreview={handlePreview}
            />
          )}
          {currentStep === 2 && (
            <PreviewStep
              previewData={previewData}
              importStatus={importStatus}
              importProgress={importProgress}
              loading={loading}
              importResult={importResult}
              onPrev={() => setCurrentStep(1)}
              onImport={handleImport}
              onViewResult={() => setCurrentStep(3)}
              onRetry={handleRetry}
            />
          )}
          {currentStep === 3 && (
            <ResultStep
              importResult={importResult}
              importProgress={importProgress}
              onRestart={handleRestart}
            />
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default ArticleImport
