// 第二步：导入配置（分类映射、静态文件处理、文章状态等）

import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd'
import type { FormInstance } from 'antd'

const { Title } = Typography
const { Option } = Select

interface ImportConfigStepProps {
  form: FormInstance
  loading: boolean
  onPrev: () => void
  onPreview: () => void
}

const ImportConfigStep: React.FC<ImportConfigStepProps> = ({
  form,
  loading,
  onPrev,
  onPreview,
}) => (
  // 原 scss 中 :global .ant-form-item { margin-bottom: 16px } 的等价 Tailwind 写法
  <div className="[&_.ant-form-item]:mb-4">
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
        <Button onClick={onPrev}>上一步</Button>
        <Button type="primary" onClick={onPreview} loading={loading}>
          预览导入
        </Button>
      </Space>
    </Card>
  </div>
)

export default ImportConfigStep
