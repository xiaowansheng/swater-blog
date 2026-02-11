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
    try {
      // 在离开配置表单之前，先保存表单的值
      const values = await form.validateFields()
      const config: MarkdownImportConfig = {
        categoryMode: values.categoryMode,
        manualCategoryId: values.categoryId,
        autoCreateCategory: values.autoCreateCategory,
        assetMode: values.assetMode,
        cdnDomain: values.cdnDomain,
        basePath: values.basePath || 'articles',
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

      const basePath = values.basePath || 'articles'
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

  // 开始导入
  const handleImport = async () => {
    if (!savedConfig) {
      message.error('配置丢失，请返回上一步重新配置')
      return
    }
    // 使用之前保存的配置（因为 form 在 Step 2 已被卸载）
    const config: MarkdownImportConfig = { ...savedConfig }

    setLoading(true)
    setImportProgress(0)

    // 模拟进度
    const progressTimer = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimer)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // 提取有效的文件对象
      const validFiles: File[] = []

      for (const file of fileList) {
        if (file.originFileObj instanceof File) {
          validFiles.push(file.originFileObj)
        }
      }

      if (validFiles.length === 0) {
        message.error('没有有效的文件，请重新选择')
        clearInterval(progressTimer)
        return
      }

      // 如果选择了「随机生成封面」，为每篇文章生成封面并上传
      if (config.coverStrategy === 'GENERATE' && previewData?.articles) {
        message.loading({ content: '正在生成封面...', key: 'coverGen', duration: 0 })
        const generatedCovers: Record<string, string> = {}

        for (const article of previewData.articles) {
          // 只为没有 frontmatter 封面的文章生成
          if (!article.cover) {
            try {
              const blob = await generateCoverBlob(article.title)
              const file = blobToFile(blob, `cover-${article.slug || Date.now()}.png`)
              const uploaded = await uploadFile(file)
              generatedCovers[article.originalFilename] = uploaded.url
            } catch (err) {
              console.warn('生成封面失败:', article.title, err)
            }
          }
        }

        // 将生成的封面 URL 传给后端
        config.generatedCovers = generatedCovers
        message.success({ content: `已生成 ${Object.keys(generatedCovers).length} 张封面`, key: 'coverGen', duration: 2 })
      }

      const result = await importMarkdownBatch(validFiles, config)

      clearInterval(progressTimer)
      setImportProgress(100)
      setImportResult(result)
      setCurrentStep(3)

      if (result.status === 'SUCCESS') {
        message.success(`成功导入 ${result.successCount} 篇文章！`)
      } else if (result.status === 'PARTIAL_SUCCESS') {
        message.warning(`部分成功：${result.successCount} 篇成功，${result.failedCount} 篇失败`)
      } else {
        message.error('导入失败，请查看错误信息')
      }
    } catch (error: any) {
      clearInterval(progressTimer)
      message.error(error.message || '导入失败')
    } finally {
      setLoading(false)
    }
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
          assetMode: 'ABSOLUTE_URL',
          importAssets: true,
          defaultStatus: 'DRAFT',
          duplicateResolution: 'SKIP',
          coverStrategy: 'FIRST_IMAGE',
          basePath: 'articles',
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

          <Form.Item label="基础存储路径" name="basePath" extra="默认: articles">
            <Input placeholder="articles" />
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
            <Button onClick={() => setCurrentStep(1)}>上一步</Button>
            <Button type="primary" onClick={handleImport} loading={loading}>
              开始导入
            </Button>
            <Button onClick={() => setCurrentStep(0)}>重新选择文件</Button>
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
