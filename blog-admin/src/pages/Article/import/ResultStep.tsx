// 第四步：导入结果（统计、成功文章、错误信息）

import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Progress,
  Space,
  Table,
  Typography,
} from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { MarkdownImportResult } from '@/api/article'

const { Title } = Typography

interface ResultStepProps {
  importResult: MarkdownImportResult | null
  importProgress: number
  onRestart: () => void
}

const ResultStep: React.FC<ResultStepProps> = ({
  importResult,
  importProgress,
  onRestart,
}) => {
  const navigate = useNavigate()

  if (!importResult) return null

  const isSuccess = importResult.status === 'SUCCESS'
  const isPartialSuccess = importResult.status === 'PARTIAL_SUCCESS'

  return (
    <div>
      <Card bordered={false}>
        {/* 原 scss 中 .resultHeader 的等价 Tailwind 写法 */}
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          {isSuccess && <CheckCircleOutlined className="text-[64px] text-[#52c41a]" />}
          {(isPartialSuccess || importResult.status === 'FAILED') && (
            <CloseCircleOutlined className="text-[64px] text-[#ff4d4f]" />
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
          <Button onClick={onRestart}>
            继续导入
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default ResultStep
