import { Form, Input, Modal, TreeSelect } from 'antd'
import type { FormInstance } from 'antd'
import type { ArticleDirectoryItem, DirectoryNodeDTO } from '@/api/articleDirectory'
import type { DirectorySelectOption } from './shared'

interface NodeEditModalProps {
  open: boolean
  editingNode: ArticleDirectoryItem | null
  form: FormInstance<DirectoryNodeDTO>
  parentNodeOptions: DirectorySelectOption[]
  onOk: () => void
  onCancel: () => void
}

const NodeEditModal: React.FC<NodeEditModalProps> = ({
  open,
  editingNode,
  form,
  parentNodeOptions,
  onOk,
  onCancel,
}) => (
  <Modal
    title={editingNode ? '编辑节点' : '新建节点'}
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    className="form-modal"
  >
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="节点名称"
        rules={[{ required: true, message: '请输入节点名称' }]}
      >
        <Input placeholder="请输入节点名称，如：基础知识" maxLength={50} />
      </Form.Item>
      <Form.Item
        name="parentId"
        label="上级节点"
        rules={[{ required: true, message: '请选择上级节点' }]}
      >
        <TreeSelect
          treeData={parentNodeOptions}
          placeholder="请选择上级节点"
          treeDefaultExpandAll
          className="w-full"
        />
      </Form.Item>
      <Form.Item name="description" label="节点描述">
        <Input.TextArea rows={3} placeholder="请输入关于该分类的描述信息（可选）" maxLength={200} showCount />
      </Form.Item>
    </Form>
  </Modal>
)

export default NodeEditModal
