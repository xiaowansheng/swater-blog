import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Tag,
  Tooltip,
  Tree,
  TreeSelect,
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

const customTreeStyles = `
.custom-directory-tree.ant-tree {
  background: transparent;
}
.custom-directory-tree .ant-tree-treenode {
  padding: 5px 0 !important;
  width: 100%;
  align-items: center;
}
.custom-directory-tree .ant-tree-node-content-wrapper {
  padding: 0 4px !important;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  flex: 1;
}
.custom-directory-tree .ant-tree-node-content-wrapper:hover {
  background-color: #f1f5f9 !important;
}
.custom-directory-tree .ant-tree-node-selected {
  background-color: #e2e8f0 !important;
}
.custom-directory-tree .ant-tree-node-selected .text-slate-800 {
  color: #0f172a !important;
  font-weight: 600;
}
.custom-directory-tree .ant-tree-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
}
.custom-directory-tree .ant-tree-indent-unit {
  width: 24px;
}
`

const ArticleDirectoryTree: React.FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<ArticleDirectoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [selectedKey, setSelectedKey] = useState<React.Key>()
  const [searchText, setSearchText] = useState('')

  const [nodeModalOpen, setNodeModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<ArticleDirectoryItem | null>(null)
  const [nodeForm] = Form.useForm<DirectoryNodeDTO>()

  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [articleForm] = Form.useForm<{ title: string; parentId: number }>()

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [articleSearchLoading, setArticleSearchLoading] = useState(false)
  const [articleOptions, setArticleOptions] = useState<Article[]>([])
  const [assignForm] = Form.useForm<{ articleId: number; parentId: number }>()
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

  const searchResultsCount = useMemo(() => {
    if (!searchText.trim()) return 0
    const keyword = searchText.trim().toLowerCase()
    let count = 0
    itemByKey.forEach((item) => {
      if (item.type === 'ROOT') return
      const haystack = (
        (item.type === 'NODE' ? item.name : '') +
        (item.title || '') +
        (item.description || '')
      ).toLowerCase()
      if (haystack.includes(keyword)) {
        count++
      }
    })
    return count
  }, [searchText, itemByKey])

  useEffect(() => {
    if (filteredKeys) {
      const keys = new Set<React.Key>()
      filteredKeys.forEach((key) => {
        const item = itemByKey.get(key)
        if (item && (item.type === 'NODE' || item.type === 'ROOT')) {
          keys.add(key)
        }
      })
      setExpandedKeys(Array.from(keys))
    }
  }, [filteredKeys, itemByKey])


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

  const parentNodeOptions = useMemo(() => {
    const buildOptions = (nodes: DirectoryViewItem[]): any[] => {
      return nodes
        .filter((n) => n.type === 'NODE')
        .map((n) => {
          const isSelfOrDescendant = editingNode
            ? (n.key === editingNode.key || isDescendant(editingNode.key, n.key))
            : false
          return {
            title: n.name,
            value: n.id,
            key: n.key,
            disabled: isSelfOrDescendant,
            children: n.children?.length ? buildOptions(n.children) : undefined,
          }
        })
    }
    return [
      {
        title: '根目录',
        value: 0,
        key: 'root',
        children: buildOptions(items),
      },
    ]
  }, [items, editingNode, isDescendant])

  const articleParentNodeOptions = useMemo(() => {
    const buildOptions = (nodes: DirectoryViewItem[]): any[] => {
      return nodes
        .filter((n) => n.type === 'NODE')
        .map((n) => ({
          title: n.name,
          value: n.id,
          key: n.key,
          children: n.children?.length ? buildOptions(n.children) : undefined,
        }))
    }
    return [
      {
        title: '根目录',
        value: 0,
        key: 'root',
        children: buildOptions(items),
      },
    ]
  }, [items])

  const openCreateNode = (parentId = 0) => {
    setEditingNode(null)
    nodeForm.resetFields()
    nodeForm.setFieldsValue({
      parentId,
      name: '',
      description: '',
    })
    setNodeModalOpen(true)
  }

  const openEditNode = (node: ArticleDirectoryItem) => {
    setEditingNode(node)
    nodeForm.setFieldsValue({
      name: node.name || '',
      description: node.description,
      parentId: node.parentId || 0,
    })
    setNodeModalOpen(true)
  }

  const handleSaveNode = async () => {
    const values = await nodeForm.validateFields()
    const payload = {
      name: values.name,
      description: values.description,
      parentId: values.parentId,
      sort: editingNode ? editingNode.sort : undefined,
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
    articleForm.resetFields()
    articleForm.setFieldsValue({
      parentId,
      title: '',
    })
    setArticleModalOpen(true)
  }

  const handleCreateArticle = async () => {
    const values = await articleForm.validateFields()
    const articleId = await createDirectoryArticle({
      title: values.title,
      parentId: values.parentId,
    })
    message.success('文章已创建')
    setArticleModalOpen(false)
    await loadTree()
    navigate(`/article/edit/${articleId}`)
  }

  const openAssignArticle = (parentId = 0) => {
    assignForm.resetFields()
    assignForm.setFieldsValue({
      parentId,
      articleId: undefined,
    })
    setArticleOptions([])
    setAssignModalOpen(true)
  }

  const handleAssignArticle = async () => {
    const values = await assignForm.validateFields()
    await assignArticleToDirectory({
      articleId: values.articleId,
      parentId: values.parentId,
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
        <span className="bg-amber-100 text-amber-900 px-0.5 rounded font-medium">{text.slice(idx, idx + keyword.length)}</span>
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
          <div className="group flex items-center justify-between gap-3 w-full pr-2 py-1.5 pl-0.5 rounded transition-all duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpenOutlined className="text-amber-500 text-lg" />
              <span className="font-semibold text-slate-800 text-sm">根目录</span>
              {counts && counts.articles > 0 && (
                <span className="px-1.5 py-0.5 text-xs text-slate-400 bg-slate-100 rounded-full font-normal">
                  {counts.articles} 篇文章
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-auto">
              <Tooltip title="新建子节点" mouseEnterDelay={0.4}>
                <Button
                  type="text"
                  size="small"
                  className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-amber-600 hover:bg-slate-200"
                  icon={<FolderAddOutlined className="text-sm" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    openCreateNode(0)
                  }}
                />
              </Tooltip>
              <Tooltip title="新建文章" mouseEnterDelay={0.4}>
                <Button
                  type="text"
                  size="small"
                  className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-slate-200"
                  icon={<FileAddOutlined className="text-sm" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    openCreateArticle(0)
                  }}
                />
              </Tooltip>
              <Tooltip title="添加已有文章" mouseEnterDelay={0.4}>
                <Button
                  type="text"
                  size="small"
                  className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-emerald-600 hover:bg-slate-200"
                  icon={<PlusOutlined className="text-sm" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    openAssignArticle(0)
                  }}
                />
              </Tooltip>
            </div>
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
        <div className="group flex items-center justify-between gap-3 w-full pr-2 py-1.5 pl-0.5 rounded transition-all duration-200">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isNode ? (
              item.children?.length ? (
                <FolderOpenOutlined className="text-amber-500 text-lg" />
              ) : (
                <FolderOutlined className="text-amber-500 text-lg" />
              )
            ) : (
              <FileTextOutlined 
                className={`text-lg ${
                  item.status === 1 ? 'text-emerald-500' : 'text-blue-500'
                }`} 
              />
            )}
            <Tooltip title={isNode ? item.description || item.name : item.title}>
              <span className={`truncate text-slate-750 text-sm ${isNode ? 'font-medium text-slate-800' : ''}`}>
                {isNode ? highlightText(item.name || '', keyword) : highlightText(item.title || '', keyword)}
              </span>
            </Tooltip>
            {!isNode && statusMeta && (
              <Tag color={statusMeta.color} className="m-0 border-0 rounded text-xs px-1.5 py-0.2">
                {statusMeta.label}
              </Tag>
            )}
            {!isNode && item.categoryName && (
              <Tag color="cyan" className="m-0 border-0 rounded text-xs px-1.5 py-0.2">
                {item.categoryName}
              </Tag>
            )}
            {isNode && counts && counts.articles > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] text-slate-400 bg-slate-100 rounded-full shrink-0">
                {counts.articles} 篇
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {!isNode && item.articleKey && (
              <span className="text-[10px] font-mono text-slate-400 group-hover:hidden transition-all duration-155">
                Key: {item.articleKey}
              </span>
            )}
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-auto">
              {isNode ? (
                <>
                  <Tooltip title="新建子节点" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-amber-600 hover:bg-slate-200"
                      icon={<FolderAddOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        openCreateNode(item.id)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="新建文章" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-slate-200"
                      icon={<FileAddOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        openCreateArticle(item.id)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="添加已有文章" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-emerald-600 hover:bg-slate-200"
                      icon={<PlusOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        openAssignArticle(item.id)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="编辑目录" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-slate-200"
                      icon={<EditOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditNode(item as ArticleDirectoryItem)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="移至根目录" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      disabled={!item.parentId}
                      className={`flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-slate-200 ${
                        !item.parentId ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      icon={<SwapOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (item.parentId) moveToRoot(item as ArticleDirectoryItem)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="删除目录" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      icon={<DeleteOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNode(item as ArticleDirectoryItem)
                      }}
                    />
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="编辑文章" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-slate-200"
                      icon={<EditOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/article/edit/${item.articleId || item.id}`)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="预览文章" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-emerald-600 hover:bg-slate-200"
                      icon={<FileTextOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/article/preview/${item.articleId || item.id}`)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="移出该目录 (移至根目录)" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      disabled={!item.parentId}
                      className={`flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-amber-600 hover:bg-slate-200 ${
                        !item.parentId ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      icon={<SwapOutlined className="text-xs" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (item.parentId) moveToRoot(item as ArticleDirectoryItem)
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </div>
          </div>
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

    // 其余都允许
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
        const rootChildren = rootItem.children || []
        if (rootChildren.length === 0) {
          position = 'INSIDE'
        } else {
          position = info.dropPosition <= 0 ? 'BEFORE' : 'AFTER'
        }
      } else {
        position = 'INSIDE'
      }
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

  const handleDoubleClick = (_event: React.MouseEvent, node: any) => {
    const item = node.item as DirectoryViewItem
    if (!item) return
    if (item.type === 'ARTICLE') {
      navigate(`/article/edit/${item.articleId || item.id}`)
    } else if (item.type === 'NODE' || item.type === 'ROOT') {
      const key = item.key
      setExpandedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      )
    }
  }

  const isTreeEmpty = !loading && items.length === 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4 fade-in">
      <style>{customTreeStyles}</style>
      
      {/* Header Panel */}
      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <ApartmentOutlined className="text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 m-0">文章归类树</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {totalCounts.get('root') && (
                <span className="text-xs text-slate-400">
                  共 {totalCounts.get('root')!.nodes} 个目录节点，{totalCounts.get('root')!.articles} 篇文章
                </span>
              )}
              {searchText.trim() && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded">
                    找到 {searchResultsCount} 个搜索结果
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="搜索目录或文章标题..."
            allowClear
            style={{ width: 220 }}
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-lg hover:border-blue-400 focus:border-blue-500"
          />
          <Tooltip title="展开全部">
            <Button
              icon={<DownOutlined />}
              disabled={!!searchText.trim()}
              onClick={() => setExpandedKeys(allNodeKeys)}
              className="rounded-lg flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title="折叠全部">
            <Button
              icon={<UpOutlined />}
              disabled={!!searchText.trim()}
              onClick={() => setExpandedKeys(['root'])}
              className="rounded-lg flex items-center justify-center"
            />
          </Tooltip>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadTree}
            className="rounded-lg flex items-center justify-center hover:text-blue-600 hover:border-blue-400"
          >
            刷新
          </Button>
          <Button 
            icon={<FolderAddOutlined />} 
            onClick={() => openCreateNode(0)}
            className="rounded-lg flex items-center justify-center hover:text-amber-600 hover:border-amber-400"
          >
            新建根节点
          </Button>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => openAssignArticle(0)}
            className="rounded-lg flex items-center justify-center hover:text-emerald-600 hover:border-emerald-400"
          >
            添加文章到根
          </Button>
          <Button 
            type="primary" 
            icon={<FileAddOutlined />} 
            onClick={() => openCreateArticle(0)}
            className="rounded-lg flex items-center justify-center shadow-sm bg-blue-600 hover:bg-blue-500 border-none"
          >
            新建文章
          </Button>
        </div>
      </div>

      {/* Tree content Panel */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 min-h-[520px] transition-all duration-300">
        <Spin spinning={loading}>
          {isTreeEmpty ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-400 text-sm">
                    当前暂无归类，您可以新建目录节点或直接添加文章。
                  </span>
                }
              >
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button 
                    icon={<FolderAddOutlined />} 
                    onClick={() => openCreateNode(0)}
                    className="rounded-lg"
                  >
                    新建根节点
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<FileAddOutlined />} 
                    onClick={() => openCreateArticle(0)}
                    className="rounded-lg bg-blue-600 hover:bg-blue-500 border-none"
                  >
                    新建文章
                  </Button>
                </div>
              </Empty>
            </div>
          ) : (
            <div className="max-w-4xl">
              <Tree
                blockNode
                showLine={{ showLeafIcon: false }}
                draggable={{ nodeDraggable: (node) => String(node.key) !== 'root' && !searchText.trim() }}
                allowDrop={handleAllowDrop}
                treeData={treeData}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKey ? [selectedKey] : []}
                className="custom-directory-tree"
                onExpand={(keys) => setExpandedKeys(keys)}
                onSelect={(keys) => setSelectedKey(keys[0])}
                onDoubleClick={handleDoubleClick}
                onDrop={handleDrop}
              />
            </div>
          )}
        </Spin>
      </div>

      {/* Node creation / editing modal */}
      <Modal
        title={editingNode ? '编辑节点' : '新建节点'}
        open={nodeModalOpen}
        onOk={handleSaveNode}
        onCancel={() => setNodeModalOpen(false)}
        destroyOnClose
        className="form-modal"
      >
        <Form form={nodeForm} layout="vertical">
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

      {/* New article modal */}
      <Modal
        title="新建文章"
        open={articleModalOpen}
        onOk={handleCreateArticle}
        onCancel={() => setArticleModalOpen(false)}
        destroyOnClose
        className="form-modal"
      >
        <Form form={articleForm} layout="vertical">
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
              treeData={articleParentNodeOptions}
              placeholder="请选择归类目录"
              treeDefaultExpandAll
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign existing article modal */}
      <Modal
        title="添加已有文章"
        open={assignModalOpen}
        onOk={handleAssignArticle}
        onCancel={() => setAssignModalOpen(false)}
        destroyOnClose
        className="form-modal"
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="parentId"
            label="目标目录"
            rules={[{ required: true, message: '请选择目标目录' }]}
          >
            <TreeSelect
              treeData={articleParentNodeOptions}
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
              onSearch={searchArticles}
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
    </div>
  )
}

export default ArticleDirectoryTree
