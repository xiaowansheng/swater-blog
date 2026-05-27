import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Tree,
  message,
} from 'antd'
import type { DataNode, TreeProps } from 'antd/es/tree'
import type { MenuProps } from 'antd'
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  FileTextOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getArticleList } from '@/api/article'
import {
  ArticleDirectoryItem,
  ArticleDirectoryNodeDTO,
  assignArticleToDirectory,
  createArticleDirectoryNode,
  createDirectoryArticle,
  deleteArticleDirectoryNode,
  getArticleDirectoryTree,
  moveArticleDirectoryItem,
  updateArticleDirectoryNode,
} from '@/api/articleDirectory'
import { ARTICLE_STATUS_MAP, Article } from '@/types'

interface DirectoryTreeDataNode extends DataNode {
  item: DirectoryViewItem
  children?: DirectoryTreeDataNode[]
}

interface RootDirectoryItem extends Omit<ArticleDirectoryItem, 'type' | 'children'> {
  type: 'ROOT'
  children: ArticleDirectoryItem[]
}

type DirectoryViewItem = ArticleDirectoryItem | RootDirectoryItem

const ArticleDirectoryTree: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<ArticleDirectoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [selectedKey, setSelectedKey] = useState<React.Key>()

  const [nodeModalOpen, setNodeModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<ArticleDirectoryItem | null>(null)
  const [nodeParentId, setNodeParentId] = useState<number>(0)
  const [nodeForm] = Form.useForm<ArticleDirectoryNodeDTO>()

  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [articleParentId, setArticleParentId] = useState<number>(0)
  const [articleForm] = Form.useForm<{ title: string }>()

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignParentId, setAssignParentId] = useState<number>(0)
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [articleLoading, setArticleLoading] = useState(false)
  const [assignForm] = Form.useForm<{ articleId: number }>()

  useEffect(() => {
    loadTree()
  }, [])

  const rootItem = useMemo<RootDirectoryItem>(() => ({
    key: 'root',
    type: 'ROOT',
    id: 0,
    parentId: 0,
    sort: 0,
    name: '根目录',
    children: items,
  }), [items])

  const itemByKey = useMemo(() => {
    const map = new Map<string, DirectoryViewItem>()
    const walk = (nodes: DirectoryViewItem[]) => {
      nodes.forEach((item) => {
        map.set(item.key, item)
        if (item.children?.length) {
          walk(item.children)
        }
      })
    }
    walk([rootItem])
    return map
  }, [rootItem])

  const loadTree = async () => {
    setLoading(true)
    try {
      const data = await getArticleDirectoryTree()
      setItems(data)
      setExpandedKeys(['root', ...collectNodeKeys(data)])
    } catch (error) {
      console.error('加载文章归类树失败', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableArticles = async () => {
    setArticleLoading(true)
    try {
      const result = await getArticleList({ page: 1, size: 1000 })
      setAvailableArticles(result.records)
    } catch (error) {
      console.error('加载文章列表失败', error)
    } finally {
      setArticleLoading(false)
    }
  }

  const collectNodeKeys = (nodes: ArticleDirectoryItem[]): React.Key[] => {
    const keys: React.Key[] = []
    const walk = (list: ArticleDirectoryItem[]) => {
      list.forEach((item) => {
        if (item.type === 'NODE') {
          keys.push(item.key)
        }
        if (item.children?.length) {
          walk(item.children)
        }
      })
    }
    walk(nodes)
    return keys
  }

  const openCreateNode = (parentId = 0) => {
    setEditingNode(null)
    setNodeParentId(parentId)
    nodeForm.resetFields()
    setNodeModalOpen(true)
  }

  const openEditNode = (node: ArticleDirectoryItem) => {
    setEditingNode(node)
    setNodeParentId(node.parentId || 0)
    nodeForm.setFieldsValue({
      name: node.name || '',
      description: node.description,
      parentId: node.parentId || 0,
      sort: node.sort,
    })
    setNodeModalOpen(true)
  }

  const handleSaveNode = async () => {
    const values = await nodeForm.validateFields()
    const payload = {
      ...values,
      parentId: editingNode ? nodeParentId : nodeParentId,
    }
    if (editingNode) {
      await updateArticleDirectoryNode(editingNode.id, payload)
      message.success('节点已更新')
    } else {
      await createArticleDirectoryNode(payload)
      message.success('节点已创建')
    }
    setNodeModalOpen(false)
    await loadTree()
  }

  const openCreateArticle = (parentId = 0) => {
    setArticleParentId(parentId)
    articleForm.resetFields()
    setArticleModalOpen(true)
  }

  const handleCreateArticle = async () => {
    const values = await articleForm.validateFields()
    const articleId = await createDirectoryArticle({
      title: values.title,
      parentId: articleParentId,
    })
    message.success('文章已创建')
    setArticleModalOpen(false)
    await loadTree()
    navigate(`/article/edit/${articleId}`)
  }

  const openAssignArticle = (parentId = 0) => {
    setAssignParentId(parentId)
    assignForm.resetFields()
    setAssignModalOpen(true)
    loadAvailableArticles()
  }

  const handleAssignArticle = async () => {
    const values = await assignForm.validateFields()
    await assignArticleToDirectory({
      articleId: values.articleId,
      parentId: assignParentId,
    })
    message.success('文章已加入归类树')
    setAssignModalOpen(false)
    await loadTree()
  }

  const handleDeleteNode = (node: ArticleDirectoryItem) => {
    Modal.confirm({
      title: '删除节点',
      content: `确定删除节点「${node.name}」吗？只有空节点可以删除。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteArticleDirectoryNode(node.id)
        message.success('节点已删除')
        await loadTree()
      },
    })
  }

  const moveToRoot = async (item: ArticleDirectoryItem) => {
    await moveArticleDirectoryItem({
      itemType: item.type,
      itemId: getMoveItemId(item),
      targetType: 'ROOT',
      position: 'INSIDE',
    })
    message.success('已移动到根目录')
    await loadTree()
  }

  const getMoveItemId = (item: ArticleDirectoryItem) => {
    return item.type === 'ARTICLE' ? item.articleId || item.id : item.id
  }

  const getContextMenuItems = (item: DirectoryViewItem): MenuProps['items'] => {
    if (item.type === 'ROOT') {
      return [
        {
          key: 'create-root-node',
          icon: <FolderAddOutlined />,
          label: '新建根节点',
          onClick: () => openCreateNode(0),
        },
        {
          key: 'create-root-article',
          icon: <FileAddOutlined />,
          label: '新建文章',
          onClick: () => openCreateArticle(0),
        },
        {
          key: 'assign-root-article',
          icon: <PlusOutlined />,
          label: '添加已有文章',
          onClick: () => openAssignArticle(0),
        },
      ]
    }

    if (item.type === 'NODE') {
      return [
        {
          key: 'create-child-node',
          icon: <FolderAddOutlined />,
          label: '新建子节点',
          onClick: () => openCreateNode(item.id),
        },
        {
          key: 'create-child-article',
          icon: <FileAddOutlined />,
          label: '新建文章',
          onClick: () => openCreateArticle(item.id),
        },
        {
          key: 'assign-article',
          icon: <PlusOutlined />,
          label: '添加已有文章',
          onClick: () => openAssignArticle(item.id),
        },
        { type: 'divider' },
        {
          key: 'rename',
          icon: <EditOutlined />,
          label: '编辑节点',
          onClick: () => openEditNode(item),
        },
        {
          key: 'move-root',
          icon: <SwapOutlined />,
          label: '移动到根目录',
          disabled: !item.parentId,
          onClick: () => moveToRoot(item),
        },
        { type: 'divider' },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: '删除节点',
          danger: true,
          onClick: () => handleDeleteNode(item),
        },
      ]
    }

    return [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑文章',
        onClick: () => navigate(`/article/edit/${item.articleId || item.id}`),
      },
      {
        key: 'preview',
        icon: <FileTextOutlined />,
        label: '预览文章',
        onClick: () => navigate(`/article/preview/${item.articleId || item.id}`),
      },
      {
        key: 'move-root',
        icon: <SwapOutlined />,
        label: '移动到根目录',
        disabled: !item.parentId,
        onClick: () => moveToRoot(item),
      },
    ]
  }

  const renderTitle = (item: DirectoryViewItem) => {
    if (item.type === 'ROOT') {
      return (
        <Dropdown trigger={['contextMenu']} menu={{ items: getContextMenuItems(item) }}>
          <div className="flex items-center gap-2 pr-2 py-1 text-gray-800">
            <FolderOpenOutlined className="text-amber-500" />
            <span className="font-medium">根目录</span>
          </div>
        </Dropdown>
      )
    }

    const isNode = item.type === 'NODE'
    const statusMeta = item.status !== undefined
      ? ARTICLE_STATUS_MAP[item.status as keyof typeof ARTICLE_STATUS_MAP]
      : undefined

    return (
      <Dropdown trigger={['contextMenu']} menu={{ items: getContextMenuItems(item) }}>
        <div className="flex items-center justify-between gap-3 pr-2 py-1">
          <div className="flex items-center gap-2 min-w-0">
            {isNode ? (
              item.children?.length ? <FolderOpenOutlined className="text-amber-500" /> : <FolderOutlined className="text-amber-500" />
            ) : (
              <FileTextOutlined className="text-blue-500" />
            )}
            <Tooltip title={isNode ? item.name : item.title}>
              <span className="truncate text-gray-800">{isNode ? item.name : item.title}</span>
            </Tooltip>
            {!isNode && statusMeta && <Tag color={statusMeta.color}>{statusMeta.label}</Tag>}
            {!isNode && item.categoryName && <Tag color="cyan">{item.categoryName}</Tag>}
          </div>
          {!isNode && item.articleKey && (
            <span className="text-xs text-gray-400 shrink-0">Key: {item.articleKey}</span>
          )}
        </div>
      </Dropdown>
    )
  }

  const buildTreeData = (nodes: DirectoryViewItem[]): DirectoryTreeDataNode[] => {
    return nodes.map((item) => ({
      key: item.key,
      title: renderTitle(item),
      item,
      children: item.children?.length ? buildTreeData(item.children) : undefined,
      isLeaf: item.type === 'ARTICLE',
    }))
  }

  const treeData = useMemo(() => buildTreeData([rootItem]), [rootItem])

  const handleAllowDrop: TreeProps['allowDrop'] = ({ dropNode, dropPosition }) => {
    const target = itemByKey.get(String(dropNode.key))
    if (!target) {
      return false
    }
    if (target.type === 'ROOT') {
      return dropPosition === 0
    }
    return !(target.type === 'ARTICLE' && dropPosition === 0)
  }

  const handleDrop: TreeProps['onDrop'] = async (info) => {
    const dragItem = itemByKey.get(String(info.dragNode.key))
    const targetItem = itemByKey.get(String(info.node.key))
    if (!dragItem || !targetItem) {
      return
    }
    if (dragItem.type === 'ROOT') {
      return
    }

    let position: 'INSIDE' | 'BEFORE' | 'AFTER'
    if (targetItem.type === 'ROOT') {
      position = 'INSIDE'
    } else if (!info.dropToGap && targetItem.type === 'NODE') {
      position = 'INSIDE'
    } else {
      const targetPosition = Number(String(info.node.pos).split('-').pop())
      const relativePosition = info.dropPosition - targetPosition
      position = relativePosition < 0 ? 'BEFORE' : 'AFTER'
    }

    try {
      await moveArticleDirectoryItem({
        itemType: dragItem.type,
        itemId: getMoveItemId(dragItem),
        targetType: targetItem.type,
        targetId: targetItem.type === 'ROOT' ? undefined : getMoveItemId(targetItem),
        position,
      })
      message.success('排序已更新')
      await loadTree()
    } catch (error) {
      console.error('移动目录项目失败', error)
    }
  }

  return (
    <div className="fade-in">
      <div className="action-bar mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <ApartmentOutlined />
            <span className="font-medium">文章归类树</span>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadTree}>
              刷新
            </Button>
            <Button icon={<FolderAddOutlined />} onClick={() => openCreateNode(0)}>
              新建根节点
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => openAssignArticle(0)}>
              添加已有文章
            </Button>
            <Button type="primary" icon={<FileAddOutlined />} onClick={() => openCreateArticle(0)}>
              新建文章
            </Button>
          </Space>
        </div>
      </div>

      <div className="table-container min-h-[520px]">
        <Spin spinning={loading}>
          <Tree
            blockNode
            showLine
            draggable={{ nodeDraggable: (node) => String(node.key) !== 'root' }}
            allowDrop={handleAllowDrop}
            treeData={treeData}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKey ? [selectedKey] : []}
            onExpand={(keys) => setExpandedKeys(keys)}
            onSelect={(keys) => setSelectedKey(keys[0])}
            onDrop={handleDrop}
          />
        </Spin>
      </div>

      <Modal
        title={editingNode ? '编辑节点' : '新建节点'}
        open={nodeModalOpen}
        onOk={handleSaveNode}
        onCancel={() => setNodeModalOpen(false)}
        destroyOnClose
      >
        <Form form={nodeForm} layout="vertical">
          <Form.Item
            name="name"
            label="节点名称"
            rules={[{ required: true, message: '请输入节点名称' }]}
          >
            <Input placeholder="节点名称" />
          </Form.Item>
          <Form.Item name="description" label="节点描述">
            <Input.TextArea rows={3} placeholder="节点描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建文章"
        open={articleModalOpen}
        onOk={handleCreateArticle}
        onCancel={() => setArticleModalOpen(false)}
        destroyOnClose
      >
        <Form form={articleForm} layout="vertical">
          <Form.Item
            name="title"
            label="文章标题"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="文章标题" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加已有文章"
        open={assignModalOpen}
        onOk={handleAssignArticle}
        onCancel={() => setAssignModalOpen(false)}
        destroyOnClose
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="articleId"
            label="选择文章"
            rules={[{ required: true, message: '请选择文章' }]}
          >
            <Select
              showSearch
              loading={articleLoading}
              placeholder="选择文章"
              optionFilterProp="label"
              options={availableArticles.map((article) => ({
                value: article.id,
                label: `[${article.id}] ${article.title}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ArticleDirectoryTree
