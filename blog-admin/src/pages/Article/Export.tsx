import { useState, useEffect } from 'react'
import {
  Card,
  Steps,
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
  Statistic,
  Row,
  Col,
  Result,
} from 'antd'
import {
  ArrowLeftOutlined,
  ExportOutlined,
  FileMarkdownOutlined,
  PictureOutlined,
  FolderOutlined,
  DownloadOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  previewMarkdownExport,
  exportMarkdown,
  downloadExport,
  MarkdownExportConfig,
  MarkdownExportPreview,
  MarkdownExportResult,
} from '@/api/article'
import { getCategoryList } from '@/api/category'
import { Category } from '@/types'

const { Step } = Steps
const { Option } = Select
const { Title } = Typography

const ArticleExport: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [previewData, setPreviewData] = useState<MarkdownExportPreview | null>(null)
  const [exportResult, setExportResult] = useState<MarkdownExportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])

  // 加载分类列表
  useEffect(() => {
    getCategoryList().then(setCategories).catch(console.error)
  }, [])

  // 步骤配置
  const steps = [
    {
      title: '导出配置',
      description: '设置导出范围和选项',
    },
    {
      title: '预览确认',
      description: '确认导出内容',
    },
    {
      title: '导出结果',
      description: '查看导出结果',
    },
  ]

  // 预览导出
  const handlePreview = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()
      
      // 构建配置，空数组和空字符串不传递
      const config: MarkdownExportConfig = {
        categoryIds: values.categoryIds?.length > 0 ? values.categoryIds : undefined,
        type: values.type || undefined, // 空字符串不传递
        directoryMode: values.directoryMode,
        fileNameMode: values.fileNameMode,
        includeFrontmatter: values.includeFrontmatter,
        includeAssets: values.includeAssets,
        exportDrafts: values.exportDrafts || false,
        assetMode: values.assetMode,
        assetDirectory: values.assetDirectory || 'assets',
        // 不传递 statuses，让后端根据 exportDrafts 判断
      }

      console.log('导出配置:', config)
      const preview = await previewMarkdownExport(config)
      setPreviewData(preview)
      setCurrentStep(1)
    } catch (error: any) {
      console.error('预览失败:', error)
      message.error(error.message || '预览失败')
    } finally {
      setLoading(false)
    }
  }

  // 开始导出
  const handleExport = async () => {
    const values = await form.validateFields()
    
    // 构建配置，空数组和空字符串不传递
    const config: MarkdownExportConfig = {
      categoryIds: values.categoryIds?.length > 0 ? values.categoryIds : undefined,
      type: values.type || undefined,
      directoryMode: values.directoryMode,
      fileNameMode: values.fileNameMode,
      includeFrontmatter: values.includeFrontmatter,
      includeAssets: values.includeAssets,
      exportDrafts: values.exportDrafts || false,
      assetMode: values.assetMode,
      assetDirectory: values.assetDirectory || 'assets',
    }


    setLoading(true)
    setExportProgress(0)

    // 模拟进度
    const progressTimer = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimer)
          return 90
        }
        return prev + 10
      })
    }, 300)

    try {
      const result = await exportMarkdown(config)

      clearInterval(progressTimer)
      setExportProgress(100)
      setExportResult(result)
      setCurrentStep(2)

      if (result.status === 'SUCCESS') {
        message.success(`成功导出 ${result.successCount} 篇文章！`)
      } else if (result.status === 'PARTIAL_SUCCESS') {
        message.warning(`部分成功：${result.successCount} 篇成功，${result.failedCount} 篇失败`)
      } else {
        message.error('导出失败，请查看错误信息')
      }
    } catch (error: any) {
      clearInterval(progressTimer)
      message.error(error.message || '导出失败')
    } finally {
      setLoading(false)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 渲染第一步：导出配置
  const renderExportConfig = () => (
    <div className="export-config">
      <Card title="导出配置" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            directoryMode: 'BY_CATEGORY',
            fileNameMode: 'TITLE',
            includeFrontmatter: true,
            includeAssets: true,
            exportDrafts: false,
            assetMode: 'DOWNLOAD',
            assetDirectory: 'assets',
          }}
        >
          <Title level={5}>
            <FolderOutlined className="mr-2" />
            导出范围
          </Title>

          <Form.Item 
            label="按分类筛选" 
            name="categoryIds" 
            extra="不选择任何分类则导出全部分类的文章"
          >
            <Select
              mode="multiple"
              placeholder="不选择 = 导出全部分类"
              allowClear
              optionFilterProp="children"
              style={{ width: '100%' }}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="文章类型" 
            name="type"
            extra="不选择则导出全部类型的文章"
          >
            <Select placeholder="不选择 = 导出全部类型" allowClear style={{ width: 300 }}>
              <Option value="1">原创</Option>
              <Option value="2">转载</Option>
              <Option value="3">翻译</Option>
              <Option value="4">引用</Option>
            </Select>
          </Form.Item>

          <Form.Item label="包含草稿" name="exportDrafts" valuePropName="checked" extra="勾选后将同时导出草稿状态的文章">
            <Switch />
          </Form.Item>

          <Divider />

          <Title level={5}>
            <FolderOutlined className="mr-2" />
            目录结构
          </Title>

          <Form.Item label="目录组织方式" name="directoryMode" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="BY_CATEGORY">按分类组织 (推荐)</Radio>
              <Radio value="BY_DATE">按日期组织 (年/月)</Radio>
              <Radio value="FLAT">扁平结构 (所有文件在同一目录)</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="文件命名方式" name="fileNameMode" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="TITLE">使用文章标题</Radio>
              <Radio value="SLUG">使用 Slug</Radio>
              <Radio value="ID_TITLE">ID-标题 格式</Radio>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Title level={5}>
            <FileMarkdownOutlined className="mr-2" />
            内容选项
          </Title>

          <Form.Item label="包含 Frontmatter 元数据" name="includeFrontmatter" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="下载静态资源" name="includeAssets" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.includeAssets !== currentValues.includeAssets}
          >
            {({ getFieldValue }) => {
              const includeAssets = getFieldValue('includeAssets')
              if (!includeAssets) return null

              return (
                <>
                  <Form.Item label="资源处理方式" name="assetMode" rules={[{ required: true }]}>
                    <Radio.Group>
                      <Radio value="DOWNLOAD">下载资源到本地目录</Radio>
                      <Radio value="KEEP_URL">保持原始 URL</Radio>
                      <Radio value="RELATIVE_PATH">转换为相对路径</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item label="资源目录名称" name="assetDirectory">
                    <Input placeholder="assets" style={{ width: 200 }} />
                  </Form.Item>
                </>
              )
            }}
          </Form.Item>

          <Divider />

          <Space>
            <Button type="primary" onClick={handlePreview} loading={loading} icon={<ExportOutlined />}>
              预览导出
            </Button>
            <Button onClick={() => navigate('/article')}>取消</Button>
          </Space>
        </Form>
      </Card>
    </div>
  )

  // 渲染第二步：预览确认
  const renderPreview = () => {
    if (!previewData) return null

    const categoryColumns = [
      { title: '分类名称', dataIndex: 'name', key: 'name' },
      { title: '导出目录', dataIndex: 'path', key: 'path' },
      { title: '文章数量', dataIndex: 'articleCount', key: 'articleCount' },
    ]

    const articleColumns = [
      { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
      { title: '分类', dataIndex: 'category', key: 'category' },
      { title: '导出路径', dataIndex: 'targetPath', key: 'targetPath', ellipsis: true },
      {
        title: '资源',
        dataIndex: 'assetCount',
        key: 'assetCount',
        render: (count: number) => (count > 0 ? <Tag icon={<PictureOutlined />}>{count}</Tag> : '-'),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === '已发布' ? 'green' : 'orange'}>{status}</Tag>
        ),
      },
    ]

    return (
      <div className="export-preview">
        <Card title="导出预览" bordered={false}>
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Statistic
                title="文章数量"
                value={previewData.totalArticleCount}
                prefix={<FileMarkdownOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="静态资源"
                value={previewData.totalAssetCount}
                prefix={<PictureOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="分类数量"
                value={previewData.categories.length}
                prefix={<FolderOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="预估大小"
                value={formatFileSize(previewData.estimatedSize)}
                prefix={<DownloadOutlined />}
              />
            </Col>
          </Row>

          {previewData.warnings.length > 0 && (
            <Alert
              message="警告"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {previewData.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              }
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {previewData.categories.length > 0 && (
            <>
              <Title level={5}>分类预览</Title>
              <Table
                columns={categoryColumns}
                dataSource={previewData.categories}
                rowKey="id"
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
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 800 }}
          />

          <Divider />

          {loading && exportProgress > 0 && (
            <Progress percent={exportProgress} status="active" style={{ marginBottom: 16 }} />
          )}

          <Space>
            <Button onClick={() => setCurrentStep(0)}>上一步</Button>
            <Button
              type="primary"
              onClick={handleExport}
              loading={loading}
              icon={<ExportOutlined />}
              disabled={previewData.totalArticleCount === 0}
            >
              开始导出
            </Button>
          </Space>
        </Card>
      </div>
    )
  }

  // 渲染第三步：导出结果
  const renderResult = () => {
    if (!exportResult) return null

    const isSuccess = exportResult.status === 'SUCCESS'
    const isPartialSuccess = exportResult.status === 'PARTIAL_SUCCESS'

    return (
      <div className="export-result">
        <Card bordered={false}>
          <Result
            status={isSuccess ? 'success' : isPartialSuccess ? 'warning' : 'error'}
            title={
              isSuccess
                ? '导出成功！'
                : isPartialSuccess
                ? '部分导出成功'
                : '导出失败'
            }
            subTitle={`成功导出 ${exportResult.successCount} 篇文章，耗时 ${(exportResult.duration / 1000).toFixed(2)} 秒`}
            extra={[
              <Button
                type="primary"
                key="download"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  try {
                    await downloadExport(exportResult.taskId)
                    message.success('下载成功')
                  } catch (e) {
                    message.error('下载失败，请重试')
                  }
                }}
              >
                下载 ZIP 文件 ({formatFileSize(exportResult.totalSize)})
              </Button>,
              <Button key="back" onClick={() => navigate('/article')}>
                返回文章列表
              </Button>,
              <Button
                key="again"
                onClick={() => {
                  setCurrentStep(0)
                  setPreviewData(null)
                  setExportResult(null)
                  setExportProgress(0)
                }}
              >
                再次导出
              </Button>,
            ]}
          />

          <Descriptions bordered size="small" column={3} style={{ marginTop: 24 }}>
            <Descriptions.Item label="成功导出">{exportResult.successCount} 篇</Descriptions.Item>
            <Descriptions.Item label="导出失败">{exportResult.failedCount} 篇</Descriptions.Item>
            <Descriptions.Item label="导出资源">{exportResult.exportedAssetCount} 个</Descriptions.Item>
            <Descriptions.Item label="文件大小">{formatFileSize(exportResult.totalSize)}</Descriptions.Item>
            <Descriptions.Item label="耗时">{(exportResult.duration / 1000).toFixed(2)} 秒</Descriptions.Item>
            <Descriptions.Item label="任务ID">{exportResult.taskId}</Descriptions.Item>
          </Descriptions>

          {exportResult.articles.length > 0 && (
            <>
              <Title level={5} style={{ marginTop: 24 }}>
                导出的文章
              </Title>
              <Table
                columns={[
                  { title: '标题', dataIndex: 'title', key: 'title' },
                  { title: '分类', dataIndex: 'category', key: 'category' },
                  { title: '导出路径', dataIndex: 'targetPath', key: 'targetPath' },
                  {
                    title: '资源',
                    dataIndex: 'assetCount',
                    key: 'assetCount',
                    render: (count: number) =>
                      count > 0 ? <Tag color="blue">{count} 个</Tag> : '-',
                  },
                ]}
                dataSource={exportResult.articles}
                rowKey="articleId"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </>
          )}

          {exportResult.errors.length > 0 && (
            <>
              <Title level={5} style={{ marginTop: 24 }}>
                错误信息
              </Title>
              {exportResult.errors.map((error, index) => (
                <Alert
                  key={index}
                  message={error.title || '导出错误'}
                  description={error.message}
                  type="error"
                  closable
                  style={{ marginBottom: 8 }}
                />
              ))}
            </>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/article')}>
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          导出 Markdown 文档
        </Title>
      </div>

      <Card bordered={false}>
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        <Spin spinning={loading && currentStep !== 2} tip="处理中...">
          {currentStep === 0 && renderExportConfig()}
          {currentStep === 1 && renderPreview()}
          {currentStep === 2 && renderResult()}
        </Spin>
      </Card>
    </div>
  )
}

export default ArticleExport
