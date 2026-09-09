import { Form, Modal, Select, TreeSelect } from 'antd'
import type { FormInstance } from 'antd'
import type { Article } from '@/types'
import type { DirectorySelectOption } from './shared'

interface AssignArticleModalProps {
  open: boolean
  form: FormInstance<{ articleId: number; parentId: number }>
  parentNodeOptions: DirectorySelectOption[]
  articleSearchLoading: boolean
  articleOptions: Article[]
  onSearch: (query: string) => void
  onOk: () => void
  onCancel: () => void
}

const AssignArticleModal: React.FC<AssignArticleModalProps> = ({
  open,
  form,
  parentNodeOptions,
  articleSearchLoading,
  articleOptions,
  onSearch,
  onOk,
  onCancel,
}) => (
  <Modal
    title="添加已有文章"
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    className="form-modal"
  >
    <Form form={form} layout="vertical">
      <Form.Item
        name="parentId"
        label="目标目录"
        rules={[{ required: true, message: '请选择目标目录' }]}
      >
        <TreeSelect
          treeData={parentNodeOptions}
          placeholder="请选择目标目录"
          treeDefaultExpandAll
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        name="articleId"
        label="选择文章"
        rules={[{ required: true, message: '请选择文章' }]}
      >
        <Select
          showSearch
          loading={articleSearchLoading}
          placeholder="输入关键词搜索并选择文章"
          filterOption={false}
          onSearch={onSearch}
          notFoundContent={articleSearchLoading ? '搜索中...' : '无匹配结果'}
          options={articleOptions.map((article) => ({
            value: article.id,
            label: `[${article.id}] ${article.title}`,
          }))}
          className="w-full"
        />
      </Form.Item>
    </Form>
  </Modal>
)

export default AssignArticleModal
