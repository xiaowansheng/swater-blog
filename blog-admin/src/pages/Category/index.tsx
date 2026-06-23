import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Breadcrumb,
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
  message,
} from 'antd'
import type { DataNode, TreeProps } from 'antd/es/tree'
import type { MenuProps } from 'antd'
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
  UpOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/category'
import { Category } from '@/types'

interface CategoryTreeDataNode extends DataNode {
  category: Category
  children?: CategoryTreeDataNode[]
}

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [selectedKey, setSelectedKey] = useState<React.Key>()
  const [searchText, setSearchText] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  const flatList = useMemo(() => {
    const list: Category[] = []
    const walk = (nodes: Category[]) => {
      nodes.forEach((cat) => {
        list.push(cat)
        if (cat.children?.length) walk(cat.children)
      })
    }
    walk(categories)
    return list
  }, [categories])

  const totalCount = useMemo(() => {
    let count = 0
    flatList.forEach((c) => { count += c.articleCount || 0 })
    return count
  }, [flatList])

  const allKeys = useMemo(() => {
    return flatList.filter((c) => c.children?.length).map((c) => `cat-${c.id}`)
  }, [flatList])

  const filteredKeys = useMemo(() => {
    if (!searchText.trim()) return null
    const keyword = searchText.trim().toLowerCase()
    const matched = new Set<string>()

    const parentMap = new Map<string, string | null>()
    const indexParents = (node: Category, parentKey: string | null) => {
      parentMap.set(`cat-${node.id}`, parentKey)
      node.children?.forEach((child) => indexParents(child, `cat-${node.id}`))
    }
    categories.forEach((c) => indexParents(c, null))

    flatList.forEach((cat) => {
      const text = (cat.name + (cat.description || '')).toLowerCase()
      if (text.includes(keyword)) {
        const key = `cat-${cat.id}`
        matched.add(key)
        let ancestor = parentMap.get(key)
        while (ancestor) {
          matched.add(ancestor)
          ancestor = parentMap.get(ancestor)
        }
      }
    })
    return matched
  }, [searchText, flatList, categories])

  const expandedKeysWithSearch = useMemo(() => {
    if (!filteredKeys) return expandedKeys
    const keys = new Set<React.Key>()
    filteredKeys.forEach((key) => {
      const cat = flatList.find((item) => `cat-${item.id}` === key)
      if (cat?.children?.length) keys.add(key)
    })
    return Array.from(keys)
  }, [filteredKeys, expandedKeys, flatList])

  const collectAllKeys = useCallback((nodes: Category[]): React.Key[] => {
    const keys: React.Key[] = []
    const walk = (list: Category[]) => {
      list.forEach((cat) => {
        if (cat.children?.length) {
          keys.push(`cat-${cat.id}`)
          walk(cat.children)
        }
      })
    }
    walk(nodes)
    return keys
  }, [])

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCategoryList()
      setCategories(data)
      setExpandedKeys(collectAllKeys(data))
    } catch (error) {
      console.error('加载分类失败', error)
    } finally {
      setLoading(false)
    }
  }, [collectAllKeys])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const openCreate = (parentId = 0) => {
    setEditingCategory(null)
    form.resetFields()
    if (parentId) form.setFieldsValue({ parentId })
    setModalVisible(true)
  }

  const openEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      parentId: category.parentId || 0,
      sort: category.sort,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editingCategory) {
      await updateCategory(editingCategory.id, values)
      message.success('更新成功')
    } else {
      await createCategory(values)
      message.success('创建成功')
    }
    setModalVisible(false)
    await loadCategories()
  }

  const handleDelete = (category: Category) => {
    const hasChildren = (category.children?.length || 0) > 0
    const hasArticles = (category.articleCount || 0) > 0
    Modal.confirm({
      title: '删除分类',
      content: hasChildren
        ? `分类「${category.name}」下还有子分类，无法删除`
        : hasArticles
          ? `分类「${category.name}」下有 ${category.articleCount} 篇文章，无法删除`
          : `确定删除分类「${category.name}」吗？删除后不可恢复。`,
      okText: '删除',
      okType: 'danger',
      okButtonProps: { disabled: hasChildren || hasArticles },
      cancelText: '取消',
      onOk: async () => {
        await deleteCategory(category.id)
        message.success('删除成功')
        await loadCategories()
      },
    })
  }

  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text
    const idx = text.toLowerCase().indexOf(keyword.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ backgroundColor: '#ffe58f', padding: '0 1px' }}>{text.slice(idx, idx + keyword.length)}</span>
        {text.slice(idx + keyword.length)}
      </>
    )
  }

  const getContextMenuItems = (category: Category): MenuProps['items'] => {
    return [
      {
        key: 'create-child',
        icon: <FolderAddOutlined />,
        label: '新建子分类',
        onClick: () => openCreate(category.id),
      },
      {
        key: 'create-sibling',
        icon: <PlusOutlined />,
        label: '新建同级分类',
        onClick: () => openCreate(category.parentId || 0),
      },
      { type: 'divider' },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑分类',
        onClick: () => openEdit(category),
      },
      { type: 'divider' },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除分类',
        danger: true,
        onClick: () => handleDelete(category),
      },
    ]
  }

  const renderTitle = (category: Category) => {
    const keyword = searchText.trim()
    const hasChildren = (category.children?.length || 0) > 0

    return (
      <Dropdown trigger={['contextMenu']} menu={{ items: getContextMenuItems(category) }}>
        <div className="flex items-center justify-between gap-3 pr-2 py-1 w-full">
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <FolderOpenOutlined className="text-amber-500" />
            ) : (
              <TagOutlined className="text-blue-400" />
            )}
            <Tooltip title={category.description || category.name}>
              <span className="truncate text-gray-800">
                {highlightText(category.name, keyword)}
              </span>
            </Tooltip>
            {category.description && (
              <span className="text-xs text-gray-400 truncate max-w-[200px] hidden sm:inline">
                {category.description}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasChildren && (
              <span className="text-xs text-gray-400">{category.children!.length} 个子分类</span>
            )}
            <Tag color={(category.articleCount || 0) > 0 ? 'blue' : 'default'}>
              {category.articleCount || 0} 篇
            </Tag>
          </div>
        </div>
      </Dropdown>
    )
  }

  const treeData = useMemo(() => {
    const buildTreeData = (nodes: Category[]): CategoryTreeDataNode[] => {
      return nodes
        .filter((cat) => !filteredKeys || filteredKeys.has(`cat-${cat.id}`))
        .map((cat) => ({
          key: `cat-${cat.id}`,
          title: renderTitle(cat),
          category: cat,
          children: cat.children?.length ? buildTreeData(cat.children) : undefined,
          isLeaf: !cat.children?.length,
        }))
    }
    return buildTreeData(categories)
  // renderTitle 引用 searchText/getContextMenuItems 等，无法逐一列出；
  // categories/filteredKeys 变化时重建即可。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, filteredKeys])

  const catByKey = useMemo(() => {
    const map = new Map<string, Category>()
    flatList.forEach((c) => map.set(`cat-${c.id}`, c))
    return map
  }, [flatList])

  const isDescendant = useCallback((parentId: number, possibleDescendantId: number): boolean => {
    const parent = flatList.find((c) => c.id === parentId)
    if (!parent?.children?.length) return false
    const walk = (nodes: Category[]): boolean => {
      for (const node of nodes) {
        if (node.id === possibleDescendantId) return true
        if (node.children?.length && walk(node.children)) return true
      }
      return false
    }
    return walk(parent.children)
  }, [flatList])

  const handleAllowDrop: TreeProps['allowDrop'] = ({ dragNode, dropNode }) => {
    if (searchText.trim()) return false
    const dragCat = catByKey.get(String(dragNode.key))
    const dropCat = catByKey.get(String(dropNode.key))
    if (!dragCat || !dropCat || dragCat.id === dropCat.id) return false

    // 不允许拖入自身后代节点
    if (isDescendant(dragCat.id, dropCat.id)) return false

    // dropToGap=true 表示放到间隙（前后插入）
    // dropToGap=false + dropPosition===0 表示放入节点内部
    return true
  }

  const handleDrop: TreeProps['onDrop'] = async (info) => {
    const dragCat = catByKey.get(String(info.dragNode.key))
    const dropCat = catByKey.get(String(info.node.key))
    if (!dragCat || !dropCat || dragCat.id === dropCat.id) return

    if (isDescendant(dragCat.id, dropCat.id)) {
      message.warning('不能将父分类拖入其子分类')
      return
    }

    let newParentId: number
    let newSort: number | undefined

    if (!info.dropToGap) {
      // 放入节点内部：成为 dropCat 的子分类
      newParentId = dropCat.id
    } else {
      // 放到间隙：与 dropCat 同级，调整排序
      newParentId = dropCat.parentId || 0

      // 计算排序值：取 dropCat 的 sort，前插减半、后插取中值
      const dropSort = dropCat.sort || 0
      // 找到同级的所有分类排序值
      const siblings = flatList.filter(
        (c) => (c.parentId || 0) === newParentId && c.id !== dragCat.id
      )
      const dropIdx = siblings.findIndex((c) => c.id === dropCat.id)

      // dropPosition > 0 表示放在 dropCat 后面，< 0 表示前面
      // Antd Tree: info.dropPosition 是相对屏幕的位置，用 pos 判断前后更准
      const posParts = String(info.node.pos).split('-')
      const nodeIndex = Number(posParts[posParts.length - 1])
      const relativePos = info.dropPosition - nodeIndex

      if (relativePos < 0) {
        // 放在 dropCat 前面
        const prevSort = dropIdx > 0 ? (siblings[dropIdx - 1].sort || 0) : 0
        newSort = Math.floor((prevSort + dropSort) / 2) || 1
      } else {
        // 放在 dropCat 后面
        const nextSort = dropIdx < siblings.length - 1 ? (siblings[dropIdx + 1].sort || 0) : dropSort + 200
        newSort = Math.floor((dropSort + nextSort) / 2) || dropSort + 100
      }
    }

    // 同父同位置则不操作
    if (dragCat.parentId === newParentId && newSort === undefined) return

    try {
      await updateCategory(dragCat.id, {
        name: dragCat.name,
        description: dragCat.description,
        parentId: newParentId,
        sort: newSort,
      })
      if (!info.dropToGap) {
        message.success(`已将「${dragCat.name}」移入「${dropCat.name}」`)
      } else {
        message.success(`已调整「${dragCat.name}」的排序`)
      }
      await loadCategories()
    } catch (error) {
      console.error('移动分类失败', error)
    }
  }

  const parentOptions = useMemo(() => {
    return flatList.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }))
  }, [flatList])

  const isTreeEmpty = !loading && flatList.length === 0

  return (
    <div className="page-container fade-in">
      <div className="mb-4">
        <Breadcrumb items={[
          { title: <Link to="/">首页</Link> },
          { title: '分类管理' },
        ]} />
      </div>
      <div className="search-bar">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <TagOutlined className="text-blue-400" />
            <span className="font-medium text-gray-700">分类管理</span>
            {flatList.length > 0 && (
              <span className="text-xs text-gray-400">
                {flatList.length} 个分类 / {totalCount} 篇文章
              </span>
            )}
          </div>
          <div className="flex-1" />
          <Input.Search
            placeholder="搜索分类"
            allowClear
            style={{ width: 180 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Tooltip title="展开全部">
            <Button
              icon={<DownOutlined />}
              size="small"
              disabled={!!searchText.trim()}
              onClick={() => setExpandedKeys(allKeys)}
            />
          </Tooltip>
          <Tooltip title="折叠全部">
            <Button
              icon={<UpOutlined />}
              size="small"
              disabled={!!searchText.trim()}
              onClick={() => setExpandedKeys([])}
            />
          </Tooltip>
          <Button icon={<ReloadOutlined />} onClick={loadCategories}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(0)}>
            新建分类
          </Button>
        </div>
      </div>

      <div className="table-container min-h-[400px]">
        <Spin spinning={loading}>
          {isTreeEmpty ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Empty
                description={<span className="text-gray-400">暂无分类，点击「新建分类」开始</span>}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(0)}>
                  新建分类
                </Button>
              </Empty>
            </div>
          ) : (
            <Tree
              blockNode
              showLine
              draggable={{ nodeDraggable: () => !searchText.trim() }}
              allowDrop={handleAllowDrop}
              onDrop={handleDrop}
              treeData={treeData}
              expandedKeys={searchText.trim() ? expandedKeysWithSearch : expandedKeys}
              selectedKeys={selectedKey ? [selectedKey] : []}
              onExpand={(keys) => setExpandedKeys(keys)}
              onSelect={(keys) => setSelectedKey(keys[0])}
            />
          )}
        </Spin>
      </div>

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="parentId" label="父级分类" initialValue={0}>
            <Select
              placeholder="选择父级分类（不选则为顶级分类）"
              allowClear
              options={[
                { value: 0, label: '无（顶级分类）' },
                ...parentOptions,
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="分类描述">
            <Input.TextArea rows={3} placeholder="请输入分类描述" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" placeholder="排序值，越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryPage
