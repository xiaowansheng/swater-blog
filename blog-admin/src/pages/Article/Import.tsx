import { useState, useEffect } from 'react'
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
  FolderOpenOutlined,
  FileMarkdownOutlined,
  PictureOutlined,
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
import styles from './Import.module.scss'

const { Dragger } = Upload
const { Step } = Steps
const { Option } = Select
const { Title, Text, Paragraph } = Typography

const ArticleImport: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewData, setPreviewData] = useState<MarkdownImportPreview | null>(null)
  const [importResult, setImportResult] = useState<MarkdownImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)

  // 调试：监控 fileList 变化
  useEffect(() => {
    console.log('fileList 状态更新:', fileList)
    console.log('fileList 长度:', fileList.length)
  }, [fileList])

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
    accept: '.md,.markdown,.png,.jpg,.jpeg,.gif,.svg,.webp',
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
      return false // 阻止自动上传
    },
    onChange: (info) => {
      // 使用 onChange 来正确更新文件列表
      setFileList(info.fileList)
    },
    customRequest: () => {
      // 阻止自动上传
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
      console.log('原始 fileList:', fileList)
      console.log('fileList 长度:', fileList.length)

      // 提取有效的文件对象
      const validFiles: File[] = []

      for (const file of fileList) {
        console.log('处理文件:', file.name, 'originFileObj:', file.originFileObj)

        // originFileObj 是实际的 File 对象
        if (file.originFileObj instanceof File) {
          validFiles.push(file.originFileObj)
        } else {
          console.warn('文件缺少 originFileObj:', file)
        }
      }

      console.log('有效文件数量:', validFiles.length)
      console.log('有效文件列表:', validFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))

      if (validFiles.length === 0) {
        message.error('没有有效的文件，请重新选择')
        return
      }

      const preview = await previewMarkdownImport(validFiles)

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
      articleType: 'post',
    }

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
  const renderFileSelection = () => (
    <div className={styles.fileSelection}>
      <Card title="上传文件" bordered={false}>
        <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传 Markdown 文件及其资源文件（图片等）
          </p>
        </Dragger>

        <div className={styles.fileStats}>
          <Space size="large">
            <Text>
              <FileMarkdownOutlined /> MD 文件: {fileList.filter((f) => f.name.endsWith('.md')).length} 个
            </Text>
            <Text>
              <PictureOutlined /> 资源文件: {fileList.filter((f) => !f.name.endsWith('.md')).length} 个
            </Text>
          </Space>
        </div>

        <Divider />

        <Space>
          <Button
            type="primary"
            onClick={() => {
              console.log('点击了下一步按钮，当前 fileList 长度:', fileList.length)
              console.log('fileList 内容:', fileList)
              handlePreview()
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
            message={previewData.getStatisticsSummary?.() || `将创建 ${previewData.articleCount} 篇文章，${previewData.categoryCount} 个分类`}
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
