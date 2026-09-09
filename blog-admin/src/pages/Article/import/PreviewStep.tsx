// 第三步：预览确认（分类/文章预览表格 + 导入进度）

import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Progress,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type {
  MarkdownImportArticlePreview,
  MarkdownImportCategoryPreview,
  MarkdownImportPreview,
  MarkdownImportResult,
} from '@/api/article'
import type { FileImportStatusEntry } from './shared'

const { Title } = Typography

interface PreviewStepProps {
  previewData: MarkdownImportPreview | null
  importStatus: Record<string, FileImportStatusEntry>
  importProgress: number
  loading: boolean
  importResult: MarkdownImportResult | null
  onPrev: () => void
  onImport: () => void
  onViewResult: () => void
  onRetry: (article: MarkdownImportArticlePreview) => void
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  previewData,
  importStatus,
  importProgress,
  loading,
  importResult,
  onPrev,
  onImport,
  onViewResult,
  onRetry,
}) => {
  if (!previewData) return null

  const categoryColumns: ColumnsType<MarkdownImportCategoryPreview> = [
    { title: '分类名称', dataIndex: 'name', key: 'name' },
    { title: '分类 Key', dataIndex: 'categoryKey', key: 'categoryKey' },
    { title: '层级', dataIndex: 'level', key: 'level', render: (level: number) => `Level ${level}` },
    { title: '文章数量', dataIndex: 'articleCount', key: 'articleCount' },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.exists && <Tag color="blue">已存在</Tag>}
          {record.willCreate && <Tag color="green">将创建</Tag>}
        </Space>
      ),
    },
  ]

  const articleColumns: ColumnsType<MarkdownImportArticlePreview> = [
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
      onFilter: (value, record) => {
        const s = importStatus[record.originalFilename]?.status || 'pending'
        if (value === 'processing') {
          return s === 'generating_cover' || s === 'importing'
        }
        return s === value
      },
      render: (_, record) => {
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
      render: (_, record) => {
        const status = importStatus[record.originalFilename]
        if (status?.status === 'failed') {
          return <Button type="link" size="small" onClick={() => onRetry(record)}>重试</Button>
        }
        return null
      }
    },
  ]

  return (
    // 原 scss 中 :global .ant-table { font-size: 13px } 的等价 Tailwind 写法
    <div className="[&_.ant-table]:text-[13px]">
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
          <Button onClick={onPrev} disabled={loading || (importProgress > 0 && importProgress < 100)}>上一步</Button>
          <Button
            type="primary"
            onClick={onImport}
            loading={loading}
            disabled={importProgress > 0 && importProgress < 100}
          >
            {importProgress > 0 && importProgress < 100 ? '导入中...' : (importResult ? '重试全部失败任务' : '开始导入')}
          </Button>
          <Button onClick={onViewResult} disabled={!importResult}>
            完成/查看结果
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default PreviewStep
