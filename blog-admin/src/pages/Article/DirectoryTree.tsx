import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Spin,
  Tag,
  Tooltip,
  Tree,
  message,
} from 'antd'
import type { AntTreeNodeProps, TreeProps } from 'antd/es/tree'
import type { MenuProps } from 'antd'
import {
  ApartmentOutlined,
  BarChartOutlined,
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
import NodeEditModal from './directory-tree/NodeEditModal'
import ArticleCreateModal from './directory-tree/ArticleCreateModal'
import AssignArticleModal from './directory-tree/AssignArticleModal'
import { customTreeStyles } from './directory-tree/shared'
import type { DirectorySelectOption, DirectoryTreeDataNode } from './directory-tree/shared'

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

  const itemByKey = useMemo(() => {
    const map = new Map<string, ArticleDirectoryItem>()
    const walk = (nodes: ArticleDirectoryItem[]) => {
      nodes.forEach((item) => {
        map.set(item.key, item)
        if (item.children?.length) {
          walk(item.children)
        }
      })
    }
    walk(items)
    return map
  }, [items])

  const allNodeKeys = useMemo(() => {
    const keys: React.Key[] = []
    const walk = (nodes: ArticleDirectoryItem[]) => {
      nodes.forEach((item) => {
        if (item.type === 'NODE') {
          keys.push(item.key)
        }
        if (item.children?.length) {
          walk(item.children)
        }
      })
    }
    walk(items)
    return keys
  }, [items])

  const totalCounts = useMemo(() => {
    const counts = new Map<string, { articles: number; nodes: number }>()
    const calc = (item: ArticleDirectoryItem): { articles: number; nodes: number } => {
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
    items.forEach(calc)
    return counts
  }, [items])

  const rootTotal = useMemo(() => {
    let articles = 0
    let nodes = 0
    const calc = (list: ArticleDirectoryItem[]) => {
      list.forEach((item) => {
        if (item.type === 'ARTICLE') articles++
        if (item.type === 'NODE') nodes++
        if (item.children?.length) calc(item.children)
      })
    }
    calc(items)
    return { articles, nodes }
  }, [items])

  const filteredKeys = useMemo(() => {
    if (!searchText.trim()) return null
    const keyword = searchText.trim().toLowerCase()
    const matched = new Set<string>()
    const ancestorOf = new Map<string, string | null>()

    const indexAncestors = (item: ArticleDirectoryItem, parentKey: string | null) => {
      ancestorOf.set(item.key, parentKey)
      item.children?.forEach((child) => indexAncestors(child, item.key))
    }
    items.forEach(item => indexAncestors(item, null))

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
  }, [searchText, itemByKey, items])

  const searchResultsCount = useMemo(() => {
    if (!searchText.trim()) return 0
    const keyword = searchText.trim().toLowerCase()
    let count = 0
    itemByKey.forEach((item) => {
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
        if (item && item.type === 'NODE') {
          keys.add(key)
        }
      })
      setExpandedKeys(Array.from(keys))
    }
  }, [filteredKeys, itemByKey])


  const collectNodeKeys = useCallback((nodes: ArticleDirectoryItem[]): React.Key[] => {
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
  }, [])

  const loadTree = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getArticleDirectoryTree()
      setItems(data)
      setExpandedKeys(collectNodeKeys(data))
    } catch (error) {
      console.error('加载文章归类树失败', error)
    } finally {
      setLoading(false)
    }
  }, [collectNodeKeys])

  useEffect(() => {
    loadTree()
  }, [loadTree])

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

  const isDescendant = useCallback((parentKey: string, possibleDescendantKey: string): boolean => {
    const parent = itemByKey.get(parentKey)
    if (!parent?.children?.length) return false
    const walk = (nodes: ArticleDirectoryItem[]): boolean => {
      for (const node of nodes) {
        if (node.key === possibleDescendantKey) return true
        if (node.children?.length && walk(node.children)) return true
      }
      return false
    }
    return walk(parent.children)
  }, [itemByKey])

  const parentNodeOptions = useMemo(() => {
    const buildOptions = (nodes: ArticleDirectoryItem[]): DirectorySelectOption[] => {
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
        key: 0,
        children: buildOptions(items),
      },
    ]
  }, [items, editingNode, isDescendant])

  const articleParentNodeOptions = useMemo(() => {
    const buildOptions = (nodes: ArticleDirectoryItem[]): DirectorySelectOption[] => {
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
        key: 0,
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
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    articleForm.setFieldsValue({
      parentId,
      title: `${dateStr} `,
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

  const getContextMenuItems = (item: ArticleDirectoryItem): MenuProps['items'] => {
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

  const renderTitle = (item: ArticleDirectoryItem) => {
    const counts = totalCounts.get(item.key)
    const keyword = searchText.trim()

    const isNode = item.type === 'NODE'
    const statusMeta = item.status !== undefined
      ? ARTICLE_STATUS_MAP[item.status as keyof typeof ARTICLE_STATUS_MAP]
      : undefined

    return (
      <Dropdown trigger={['contextMenu']} menu={{ items: getContextMenuItems(item) }}>
        <div className="group flex items-center justify-between gap-3 w-full pr-2 py-1 pl-0.5 rounded-lg transition-all duration-200">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {isNode ? (
              <div className={`dir-icon-wrap w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${
                item.children?.length
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                  : 'bg-gradient-to-br from-amber-300 to-amber-500'
              }`}>
                {item.children?.length ? (
                  <FolderOpenOutlined className="text-white text-sm" />
                ) : (
                  <FolderOutlined className="text-white text-sm" />
                )}
              </div>
            ) : (
              <div className={`article-icon-wrap w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${
                item.status === 1
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                  : 'bg-gradient-to-br from-blue-400 to-indigo-500'
              }`}>
                <FileTextOutlined className="text-white text-sm" />
              </div>
            )}
            <Tooltip title={isNode ? item.description || item.name : item.title}>
              <span className={`dir-node-name truncate text-sm ${
                isNode ? 'font-semibold text-slate-800' : 'text-slate-600'
              }`}>
                {isNode ? highlightText(item.name || '', keyword) : highlightText(item.title || '', keyword)}
              </span>
            </Tooltip>
            {!isNode && statusMeta && (
              <Tag color={statusMeta.color} className="m-0 border-0 rounded-full text-[11px] px-2 py-0 leading-5 font-medium">
                {statusMeta.label}
              </Tag>
            )}
            {!isNode && item.categoryName && (
              <Tag color="cyan" className="m-0 border-0 rounded-full text-[11px] px-2 py-0 leading-5 font-medium">
                {item.categoryName}
              </Tag>
            )}
            {!isNode && item.articleKey && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100/60 px-1.5 py-0.5 rounded leading-4">
                {item.articleKey}
              </span>
            )}
            {isNode && counts && counts.articles > 0 && (
              <span className="px-2 py-0.5 text-[10px] text-slate-500 bg-slate-100/80 rounded-full shrink-0 font-medium border border-slate-200/60 leading-4">
                {counts.articles}
              </span>
            )}
          </div>

          <div className="tree-node-operations flex items-center gap-0.5 ml-auto shrink-0">
            {isNode ? (
                <>
                  <Tooltip title="新建子节点" mouseEnterDelay={0.4}>
                    <Button
                      type="text"
                      size="small"
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
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
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
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
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
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
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
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
                      className={`flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg ${
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
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
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
                      className="flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
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
                      className={`flex items-center justify-center p-1 h-6 w-6 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg ${
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
      </Dropdown>
    )
  }

  const treeData = useMemo(() => {
    const buildTreeData = (nodes: ArticleDirectoryItem[]): DirectoryTreeDataNode[] => {
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
    return buildTreeData(items)
  // renderTitle 引用了组件内大量函数/状态，此处无法逐一列出；
  // treeData 在 items/filteredKeys/searchText/totalCounts 等变化时需要重建。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filteredKeys])

  const handleAllowDrop: TreeProps['allowDrop'] = ({ dragNode, dropNode, dropPosition }) => {
    if (searchText.trim()) return false
    const dragItem = itemByKey.get(String(dragNode.key))
    const target = itemByKey.get(String(dropNode.key))
    if (!dragItem || !target || dragItem.key === target.key) return false

    // 不允许拖入自身后代节点
    if (dragItem.type === 'NODE' && isDescendant(dragItem.key, target.key)) return false

    // 文章不能作为容器（不能把东西放进文章内部）
    if (target.type === 'ARTICLE' && dropPosition === 0) return false

    // 其余都允许
    return true
  }

  const handleDrop: TreeProps['onDrop'] = async (info) => {
    const dragItem = itemByKey.get(String(info.dragNode.key))
    const targetItem = itemByKey.get(String(info.node.key))
    if (!dragItem || !targetItem) return

    // 前端校验：不允许父节点拖入子节点
    if (dragItem.type === 'NODE' && isDescendant(dragItem.key, targetItem.key)) {
      message.warning('不能将目录节点拖入其子节点')
      return
    }

    let position: 'INSIDE' | 'BEFORE' | 'AFTER'
    let targetType: 'ROOT' | 'NODE' | 'ARTICLE' = targetItem.type
    let targetId: number | undefined = getMoveItemId(targetItem)

    // 新增"拖到树外层间隙(dropToGap 且目标为顶层)"识别为移到根
    if (info.dropToGap && targetItem.parentId === 0) {
      targetType = 'ROOT'
      targetId = undefined
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
        targetType,
        targetId,
        position,
      })
      message.success('排序已更新')
      await loadTree()
    } catch (error) {
      console.error('移动目录项目失败', error)
    }
  }

  const handleSelect: TreeProps['onSelect'] = (_selectedKeys, info) => {
    const key = info.node.key
    setSelectedKey(key)

    const item = (info.node as unknown as DirectoryTreeDataNode).item
    if (!item) return

    if (item.type === 'ARTICLE') {
      navigate(`/article/preview/${item.articleId || item.id}`)
    } else if (item.type === 'NODE') {
      setExpandedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      )
    }
  }

  const isTreeEmpty = !loading && items.length === 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 fade-in">
      <style>{customTreeStyles}</style>

      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        {/* Title Row */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/60 shrink-0">
              <ApartmentOutlined className="text-lg text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 m-0 tracking-tight leading-none">文章归类树</h1>
              <div className="flex items-center gap-2 mt-1">
                {rootTotal && (
                  <span className="text-xs text-slate-400">
                    <span className="text-slate-600 font-semibold">{rootTotal.nodes}</span> 个目录节点
                    <span className="mx-1 text-slate-300">·</span>
                    <span className="text-slate-600 font-semibold">{rootTotal.articles}</span> 篇文章
                  </span>
                )}
                {searchText.trim() && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    找到 {searchResultsCount} 个结果
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: primary actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTree}
              size="small"
              className="rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-400"
            >
              刷新
            </Button>
            <Button
              icon={<BarChartOutlined />}
              size="small"
              onClick={() => navigate('/article/tree/mindmap')}
              className="rounded-lg text-indigo-600 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400"
            >
              归类可视化
            </Button>
            <div className="w-px h-4 bg-slate-200" />
            <Button
              icon={<FolderAddOutlined />}
              size="small"
              onClick={() => openCreateNode(0)}
              className="rounded-lg text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-400"
            >
              新建节点
            </Button>
            <Button
              icon={<PlusOutlined />}
              size="small"
              onClick={() => openAssignArticle(0)}
              className="rounded-lg text-emerald-600 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400"
            >
              添加文章
            </Button>
            <Button
              type="primary"
              icon={<FileAddOutlined />}
              size="small"
              onClick={() => openCreateArticle(0)}
              className="rounded-lg border-none shadow-sm shadow-blue-200"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              新建文章
            </Button>
          </div>
        </div>

        {/* Search + Tree Controls Row */}
        <div className="px-5 pb-4 border-t border-slate-100 pt-3 flex items-center gap-2">
          <Input
            placeholder="搜索目录或文章标题..."
            allowClear
            style={{ width: 260 }}
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-lg hover:border-blue-400"
            size="small"
          />
          <div className="w-px h-4 bg-slate-200 mx-0.5" />
          <Tooltip title="展开全部">
            <Button
              icon={<DownOutlined />}
              size="small"
              disabled={!!searchText.trim()}
              onClick={() => setExpandedKeys(allNodeKeys)}
              className="rounded-lg"
            />
          </Tooltip>
          <Tooltip title="折叠全部">
            <Button
              icon={<UpOutlined />}
              size="small"
              disabled={!!searchText.trim()}
              onClick={() => setExpandedKeys([])}
              className="rounded-lg"
            />
          </Tooltip>
          {searchText.trim() && (
            <span className="text-xs text-slate-400 ml-1">搜索时展开/折叠不可用</span>
          )}
        </div>
      </div>


      {/* Tree content Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 min-h-[520px] transition-all duration-300">
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
                switcherIcon={(props: AntTreeNodeProps) => {
                  if (props.isLeaf) return null
                  return (
                    <DownOutlined
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      style={{
                        fontSize: 10,
                        transform: props.expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  )
                }}
                draggable={{ nodeDraggable: () => !searchText.trim() }}
                allowDrop={handleAllowDrop}
                treeData={treeData}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKey ? [selectedKey] : []}
                className="custom-directory-tree"
                onExpand={(keys) => setExpandedKeys(keys)}
                onSelect={handleSelect}
                onDrop={handleDrop}
              />
            </div>
          )}
        </Spin>
      </div>

      {/* Node creation / editing modal */}
      <NodeEditModal
        open={nodeModalOpen}
        editingNode={editingNode}
        form={nodeForm}
        parentNodeOptions={parentNodeOptions}
        onOk={handleSaveNode}
        onCancel={() => setNodeModalOpen(false)}
      />

      {/* New article modal */}
      <ArticleCreateModal
        open={articleModalOpen}
        form={articleForm}
        parentNodeOptions={articleParentNodeOptions}
        onOk={handleCreateArticle}
        onCancel={() => setArticleModalOpen(false)}
      />

      {/* Assign existing article modal */}
      <AssignArticleModal
        open={assignModalOpen}
        form={assignForm}
        parentNodeOptions={articleParentNodeOptions}
        articleSearchLoading={articleSearchLoading}
        articleOptions={articleOptions}
        onSearch={searchArticles}
        onOk={handleAssignArticle}
        onCancel={() => setAssignModalOpen(false)}
      />
    </div>
  )
}

export default ArticleDirectoryTree
