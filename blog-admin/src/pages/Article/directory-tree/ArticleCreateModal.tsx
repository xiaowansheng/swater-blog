import { Form, Input, Modal, TreeSelect } from 'antd'
import type { FormInstance } from 'antd'
import type { DirectorySelectOption } from './shared'

interface ArticleCreateModalProps {
  open: boolean
  form: FormInstance<{ title: string; parentId: number }>
  parentNodeOptions: DirectorySelectOption[]
  onOk: () => void
  onCancel: () => void
}

const ArticleCreateModal: React.FC<ArticleCreateModalProps> = ({
  open,
  form,
  parentNodeOptions,
  onOk,
  onCancel,
}) => (
  <Modal
    title="新建文章"
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    className="form-modal"
  >
    <Form form={form} layout="vertical">
      <Form.Item
        name="title"
        label="文章标题"
        rules={[{ required: true, message: '请输入文章标题' }]}
      >
        <Input placeholder="请输入文章标题" maxLength={100} />
      </Form.Item>
      <Form.Item
        name="parentId"
        label="归类目录"
        rules={[{ required: true, message: '请选择归类目录' }]}
      >
        <TreeSelect
          treeData={parentNodeOptions}
          placeholder="请选择归类目录"
          treeDefaultExpandAll
          className="w-full"
        />
      </Form.Item>
    </Form>
  </Modal>
)

export default ArticleCreateModal
