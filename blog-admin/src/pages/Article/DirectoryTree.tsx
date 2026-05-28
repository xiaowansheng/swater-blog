import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Dropdown,
  Empty,
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
  DownOutlined,
  EditOutlined,
  FileAddOutlined,
  FileTextOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getArticleList } from '@/api/article'
import {
  ArticleDirectoryItem,
  DirectoryNodeDTO,
  assignArticleToDirectory,
  createDirectoryNode,
  createDirectoryArticle,
  deleteDirectoryNode,
  getArticleDirectoryTree,
  moveArticleDirectoryItem,
  updateDirectoryNode,
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
  const [searchText, setSearchText] = useState('')

  const [nodeModalOpen, setNodeModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<ArticleDirectoryItem | null>(null)
  const [nodeParentId, setNodeParentId] = useState<number>(0)
  const [nodeForm] = Form.useForm<DirectoryNodeDTO>()

  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [articleParentId, setArticleParentId] = useState<number>(0)
  const [articleForm] = Form.useForm<{ title: string }>()

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignParentId, setAssignParentId] = useState<number>(0)
  const [articleSearchLoading, setArticleSearchLoading] = useState(false)
  const [articleOptions, setArticleOptions] = useState<Article[]>([])
  const [assignForm] = Form.useForm<{ articleId: number }>()
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()

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

  const allNodeKeys = useMemo(() => {
    const keys: React.Key[] = []
    const walk = (nodes: DirectoryViewItem[]) => {
      nodes.forEach((item) => {
        if (item.type === 'NODE' || item.type === 'ROOT') {
          keys.push(item.key)
        }
        if (item.children?.length) {
          walk(item.children)
        }
      })
    }
    walk([rootItem])
    return keys
  }, [rootItem])

  const totalCounts = useMemo(() => {
    const counts = new Map<string, { articles: number; nodes: number }>()
    const calc = (item: DirectoryViewItem): { articles: number; nodes: number } => {
      let articles = 0
      let nodes = 0
      if (item.type === 'ARTICLE') articles = 1
      if (item.type === 'NODE') nodes = 1
      item.children?.forEach((child) => {
        const c = calc(child)
        articles += c.articles
        nodes += c.nodes
      })
      counts.set(item.key, { articles, nodes })
      return { articles, nodes }
    }
    calc(rootItem)
    return counts
  }, [rootItem])

  const filteredKeys = useMemo(() => {
    if (!searchText.trim()) return null
    const keyword = searchText.trim().toLowerCase()
    const matched = new Set<string>()
    const ancestorOf = new Map<string, string | null>()

    const indexAncestors = (item: DirectoryViewItem, parentKey: string | null) => {
      ancestorOf.set(item.key, parentKey)
      item.children?.forEach((child) => indexAncestors(child, item.key))
    }
    rootItem.children?.forEach((child) => indexAncestors(child, null))

    itemByKey.forEach((item, key) => {
      const haystack = (
        (item.type === 'NODE' ? item.name : '') +
        (item.title || '') +
        (item.description || '')
      ).toLowerCase()
      if (haystack.includes(keyword)) {
        matched.add(key)
        let ancestor = ancestorOf.get(key)
        while (ancestor) {
          matched.add(ancestor)
          ancestor = ancestorOf.get(ancestor)
        }
      }
    })
    return matched
  }, [searchText, itemByKey, rootItem])

  const expandedKeysWithSearch = useMemo(() => {
    if (!filteredKeys) return expandedKeys
    const keys = new Set<React.Key>()
    filteredKeys.forEach((key) => {
      const item = itemByKey.get(key)
      if (item && (item.type === 'NODE' || item.type === 'ROOT')) {
        keys.add(key)
      }
    })
    return Array.from(keys)
  }, [filteredKeys, expandedKeys, itemByKey])

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

  const searchArticles = useCallback((query: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!query.trim()) {
      setArticleOptions([])
      return
    }
    searchTimerRef.current = setTimeout(async () => {
      setArticleSearchLoading(true)
      try {
        const result = await getArticleList({ page: 1, size: 20, keyword: query })
        setArticleOptions(result.records)
      } catch {
        console.error('搜索文章失败')
      } finally {
        setArticleSearchLoading(false)
      }
    }, 300)
  }, [])

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
      await updateDirectoryNode(editingNode.id, payload)
      message.success('节点已更新')
    } else {
      await createDirectoryNode(payload)
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
    setArticleOptions([])
    setAssignModalOpen(true)
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
        await deleteDirectoryNode(node.id)
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

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text
    const lowerText = text.toLowerCase()
    const lowerKeyword = keyword.toLowerCase()
    const idx = lowerText.indexOf(lowerKeyword)
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ backgroundColor: '#ffe58f', padding: '0 1px' }}>{text.slice(idx, idx + keyword.length)}</span>
        {text.slice(idx + keyword.length)}
      </>
    )
  }

  const renderTitle = (item: DirectoryViewItem) => {
    const counts = totalCounts.get(item.key)
    const keyword = searchText.trim()

    if (item.type === 'ROOT') {
      return (
        <Dropdown trigger={['contextMenu']} menu={{ items: getContextMenuItems(item) }}>
          <div className="flex items-center gap-2 pr-2 py-1 text-gray-800">
            <FolderOpenOutlined className="text-amber-500" />
            <span className="font-medium">根目录</span>
            {counts && counts.articles > 0 && (
              <span className="text-xs text-gray-400">{counts.articles} 篇文章</span>
            )}
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
            <Tooltip title={isNode ? item.description || item.name : item.title}>
              <span className="truncate text-gray-800">
                {isNode ? highlightText(item.name || '', keyword) : highlightText(item.title || '', keyword)}
              </span>
            </Tooltip>
            {!isNode && statusMeta && <Tag color={statusMeta.color}>{statusMeta.label}</Tag>}
            {!isNode && item.categoryName && <Tag color="cyan">{item.categoryName}</Tag>}
            {isNode && counts && (
              <span className="text-xs text-gray-400 shrink-0">{counts.articles} 篇</span>
            )}
          </div>
          {!isNode && item.articleKey && (
            <span className="text-xs text-gray-400 shrink-0">Key: {item.articleKey}</span>
          )}
        </div>
      </Dropdown>
    )
  }

  const buildTreeData = (nodes: DirectoryViewItem[]): DirectoryTreeDataNode[] => {
    return nodes
      .filter((item) => !filteredKeys || filteredKeys.has(item.key))
      .map((item) => ({
        key: item.key,
        title: renderTitle(item),
        item,
        children: item.children?.length ? buildTreeData(item.children) : undefined,
        isLeaf: item.type === 'ARTICLE',
      }))
  }

  const treeData = useMemo(() => buildTreeData([rootItem]), [rootItem, filteredKeys, totalCounts, searchText])

  const isDescendant = useCallback((parentKey: string, possibleDescendantKey: string): boolean => {
    const parent = itemByKey.get(parentKey)
    if (!parent?.children?.length) return false
    const walk = (nodes: DirectoryViewItem[]): boolean => {
      for (const node of nodes) {
        if (node.key === possibleDescendantKey) return true
        if (node.children?.length && walk(node.children)) return true
      }
      return false
    }
    return walk(parent.children)
  }, [itemByKey])

  const handleAllowDrop: TreeProps['allowDrop'] = ({ dragNode, dropNode, dropPosition }) => {
    if (searchText.trim()) return false
    const dragItem = itemByKey.get(String(dragNode.key))
    const target = itemByKey.get(String(dropNode.key))
    if (!dragItem || !target || dragItem.key === target.key) return false
    if (dragItem.type === 'ROOT') return false

    // 不允许拖入自身后代节点
    if (dragItem.type === 'NODE' && isDescendant(dragItem.key, target.key)) return false

    // 根目录允许放入内部和间隙插入
    if (target.type === 'ROOT') return true

    // 文章不能作为容器（不能把东西放进文章内部）
    if (target.type === 'ARTICLE' && dropPosition === 0) return false

    // 其余都允许：放入节点内部、间隙前后插入
    return true
  }

  const handleDrop: TreeProps['onDrop'] = async (info) => {
    const dragItem = itemByKey.get(String(info.dragNode.key))
    const targetItem = itemByKey.get(String(info.node.key))
    if (!dragItem || !targetItem) return
    if (dragItem.type === 'ROOT') return

    // 前端校验：不允许父节点拖入子节点
    if (dragItem.type === 'NODE' && isDescendant(dragItem.key, targetItem.key)) {
      message.warning('不能将目录节点拖入其子节点')
      return
    }

    let position: 'INSIDE' | 'BEFORE' | 'AFTER'
    if (targetItem.type === 'ROOT') {
      if (info.dropToGap) {
        // 拖到根目录间隙：插入到根级最前或最后
        const rootChildren = rootItem.children || []
        if (rootChildren.length === 0) {
          position = 'INSIDE'
        } else {
          // dropPosition <= 0 表示最前面，否则最后面
          position = info.dropPosition <= 0 ? 'BEFORE' : 'AFTER'
        }
      } else {
        position = 'INSIDE'
      }
    } else if (!info.dropToGap && targetItem.type === 'NODE') {
      // 放入节点内部
      position = 'INSIDE'
    } else {
      // 间隙插入：与目标同级，在其前面或后面
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

  const isTreeEmpty = !loading && items.length === 0

  return (
    <div className="fade-in">
      <div className="action-bar mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <ApartmentOutlined />
            <span className="font-medium">文章归类树</span>
            {totalCounts.get('root') && (
              <span className="text-xs text-gray-400">
                {totalCounts.get('root')!.nodes} 个目录 / {totalCounts.get('root')!.articles} 篇文章
              </span>
            )}
          </div>
          <Space>
            <Input.Search
              placeholder="搜索文章或目录"
              allowClear
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Tooltip title="展开全部">
              <Button
                icon={<DownOutlined />}
                size="small"
                disabled={!!searchText.trim()}
                onClick={() => setExpandedKeys(allNodeKeys)}
              />
            </Tooltip>
            <Tooltip title="折叠全部">
              <Button
                icon={<UpOutlined />}
                size="small"
                disabled={!!searchText.trim()}
                onClick={() => setExpandedKeys(['root'])}
              />
            </Tooltip>
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
          {isTreeEmpty ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Empty
                description={
                  <span className="text-gray-400">
                    暂无文章归类，点击「新建根节点」或「新建文章」开始
                  </span>
                }
              >
                <Space>
                  <Button icon={<FolderAddOutlined />} onClick={() => openCreateNode(0)}>
                    新建根节点
                  </Button>
                  <Button type="primary" icon={<FileAddOutlined />} onClick={() => openCreateArticle(0)}>
                    新建文章
                  </Button>
                </Space>
              </Empty>
            </div>
          ) : (
            <Tree
              blockNode
              showLine
              draggable={{ nodeDraggable: (node) => String(node.key) !== 'root' && !searchText.trim() }}
              allowDrop={handleAllowDrop}
              treeData={treeData}
              expandedKeys={searchText.trim() ? expandedKeysWithSearch : expandedKeys}
              selectedKeys={selectedKey ? [selectedKey] : []}
              onExpand={(keys) => setExpandedKeys(keys)}
              onSelect={(keys) => setSelectedKey(keys[0])}
              onDrop={handleDrop}
            />
          )}
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
              loading={articleSearchLoading}
              placeholder="输入关键词搜索文章"
              filterOption={false}
              onSearch={searchArticles}
              notFoundContent={articleSearchLoading ? '搜索中...' : '无匹配结果'}
              options={articleOptions.map((article) => ({
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
