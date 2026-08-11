import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Breadcrumb, Spin, Tooltip } from 'antd'
import {
  ApartmentOutlined,
  FileTextOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  NodeIndexOutlined,
  ReadOutlined,
  GoldOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import { Button, message, Modal } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import ReactECharts, { EChartsInstance } from 'echarts-for-react'
import {
  getArticleDirectoryTree,
  ArticleDirectoryItem,
  moveArticleDirectoryItem,
  deleteDirectoryNode,
} from '@/api/articleDirectory'

interface MindMapTreeNodeData {
  name?: string
  _type?: 'ROOT' | 'NODE' | 'ARTICLE'
  _label?: string
  _fullLabel?: string
  _id?: number
  _articleId?: number
  _articleKey?: string
  _nodeKey?: string
  _parentId?: number
  _subCount?: number
  _categoryName?: string
  _status?: number
  _createTime?: string
  _updateTime?: string
  _articleCount?: number
  _depth?: number
  depth?: number
  value?: number
  children?: MindMapTreeNodeData[]
}

interface MindMapCallbackParams {
  name?: string
  collapsed?: boolean
  data?: MindMapTreeNodeData
  event?: { event?: Event }
}

const NODE_GRADIENTS = [
  ['#fbbf24', '#f59e0b'],
  ['#fb923c', '#ea580c'],
  ['#f87171', '#dc2626'],
  ['#a78bfa', '#7c3aed'],
  ['#34d399', '#059669'],
]

const ARTICLE_COLORS = ['#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#67e8f9']

const countArticles = (items: ArticleDirectoryItem[]): number => {
  let count = 0
  for (const item of items) {
    if (item.type === 'ARTICLE') count++
    if (item.children?.length) count += countArticles(item.children)
  }
  return count
}

const getMaxDepth = (items: ArticleDirectoryItem[], depth = 0): number => {
  let max = depth
  for (const item of items) {
    if (item.children?.length) {
      max = Math.max(max, getMaxDepth(item.children, depth + 1))
    }
  }
  return max
}

const buildEChartsTreeData = (items: ArticleDirectoryItem[], depth = 0): MindMapTreeNodeData[] => {
  return items.map((item) => {
    const isNode = item.type === 'NODE'
    const label = isNode ? item.name || '未命名' : item.title || '未命名'
    const subCount = isNode && item.children ? countArticles(item.children) : 0
    const truncated = label.length > 20 ? `${label.slice(0, 18)}…` : label

    const colorIdx = depth % NODE_GRADIENTS.length

    return {
      name: truncated,
      _label: label,
      _fullLabel: label,
      _type: item.type,
      _id: item.id,
      _articleId: item.articleId,
      _articleKey: item.articleKey,
      _nodeKey: item.key,
      _parentId: item.parentId,
      _subCount: subCount,
      _categoryName: item.categoryName,
      _status: item.status,
      _createTime: item.createTime,
      _updateTime: item.updateTime,
      _articleCount: item.type === 'ARTICLE' ? 1 : 0,
      _depth: depth,
      value: isNode ? subCount || 1 : 1,
      itemStyle: {
        color: isNode
          ? {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 1,
              colorStops: [
                { offset: 0, color: NODE_GRADIENTS[colorIdx][0] },
                { offset: 1, color: NODE_GRADIENTS[colorIdx][1] },
              ],
            }
          : ARTICLE_COLORS[depth % ARTICLE_COLORS.length],
        shadowBlur: isNode ? 8 : 4,
        shadowColor: isNode
          ? `rgba(245, 158, 11, 0.2)`
          : `rgba(96, 165, 250, 0.15)`,
        shadowOffsetY: 2,
      },
      children: item.children?.length ? buildEChartsTreeData(item.children, depth + 1) : undefined,
    }
  })
}

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate()
  const [treeItems, setTreeItems] = useState<ArticleDirectoryItem[]>([])
  const chartRef = useRef<ReactECharts>(null)

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    type: 'NODE' | 'ARTICLE'
    id: number
    articleId?: number
    parentId?: number
    name?: string
  } | null>(null)

  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getArticleDirectoryTree()
      setTreeItems(data)
    } catch (error) {
      console.error('加载归类树失败', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMoveToRoot = useCallback(async (articleId: number) => {
    try {
      await moveArticleDirectoryItem({
        itemType: 'ARTICLE',
        itemId: articleId,
        targetType: 'ROOT',
        position: 'INSIDE',
      })
      message.success('已移动到根目录')
      loadData()
    } catch {
      message.error('移动失败')
    }
  }, [loadData])

  const handleDeleteNode = useCallback(async (nodeId: number, name?: string) => {
    Modal.confirm({
      title: '删除节点',
      content: `确定删除节点「${name || '未命名'}」吗？只有空节点可以删除。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDirectoryNode(nodeId)
          message.success('节点已删除')
          setContextMenu(null)
          loadData()
        } catch {
          message.error('删除失败')
        }
      },
    })
  }, [loadData])

  const totalNodes = useMemo(() => {
    let nodes = 0
    let articles = 0
    const walk = (items: ArticleDirectoryItem[]) => {
      items.forEach((item) => {
        if (item.type === 'NODE') nodes++
        if (item.type === 'ARTICLE') articles++
        if (item.children?.length) walk(item.children)
      })
    }
    walk(treeItems)
    return { nodes, articles }
  }, [treeItems])

  const maxDepth = useMemo(() => getMaxDepth(treeItems), [treeItems])

  const mindMapData = useMemo(() => ({
    name: '根目录',
    _type: 'ROOT',
    _label: '根目录',
    _fullLabel: `根目录\n${totalNodes.nodes} 个节点 · ${totalNodes.articles} 篇文章`,
    value: totalNodes.nodes + totalNodes.articles,
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 1, y2: 1,
        colorStops: [
          { offset: 0, color: '#818cf8' },
          { offset: 1, color: '#6366f1' },
        ],
      },
      borderRadius: 10,
      shadowBlur: 16,
      shadowColor: 'rgba(99, 102, 241, 0.35)',
      shadowOffsetY: 4,
    },
    children: buildEChartsTreeData(treeItems),
  }), [treeItems, totalNodes])

  const mindMapOption = useMemo(() => ({
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 16],
      extraCssText: 'border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);',
      textStyle: { color: '#1e293b', fontSize: 13 },
      formatter: (params: MindMapCallbackParams) => {
        const data: MindMapTreeNodeData = params.data || {}
        const isNode = data._type === 'NODE'
        const isRoot = data._type === 'ROOT'
        let html = `<div style="line-height:1.8">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:#1e293b">${data._fullLabel || params.name}</div>`
        if (isRoot) {
          html += `<div style="color:#6366f1;font-weight:500">🏠 根目录</div>`
        } else if (isNode) {
          html += `<div style="color:#f59e0b;font-weight:500">📁 目录节点</div>`
          if ((data._subCount ?? 0) > 0) {
            html += `<div style="color:#64748b">包含 <b>${data._subCount}</b> 篇文章</div>`
          }
        } else {
          html += `<div style="color:#3b82f6;font-weight:500;margin-bottom:4px">📄 文章</div>`
          
          html += `<div style="display:flex;gap:8px;font-size:12px;color:#64748b;margin-bottom:2px">`
          if (data._articleId || data._id) {
            html += `<span>ID: ${data._articleId || data._id}</span>`
          }
          if (data._nodeKey) {
            html += `<span>Key: ${data._nodeKey}</span>`
          }
          html += `</div>`

          if (data._categoryName) {
            html += `<div style="color:#64748b;font-size:12px;margin-bottom:2px">分类：${data._categoryName}</div>`
          }
          if (data._status !== undefined) {
            html += `<div style="color:#64748b;font-size:12px;margin-bottom:2px">状态：${data._status === 1 ? '已发布' : '草稿'}</div>`
          }
          
          if (data._createTime || data._updateTime) {
            html += `<div style="margin-top:6px;padding-top:4px;border-top:1px dashed #e2e8f0;font-size:11px;color:#94a3b8">`
            if (data._createTime) {
              html += `<div style="margin-bottom:2px">创建：${data._createTime}</div>`
            }
            if (data._updateTime) {
              html += `<div>更新：${data._updateTime}</div>`
            }
            html += `</div>`
          }

          html += `<div style="margin-top:6px;padding-top:4px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8">右键可查看更多操作</div>`
        }
        html += '</div>'
        return html
      },
    },
    series: [
      {
        type: 'tree',
        data: [mindMapData],
        top: '4%',
        left: '6%',
        bottom: '4%',
        right: '18%',
        layout: 'orthogonal',
        orient: 'LR',
        symbol: (_value: number, params: MindMapCallbackParams) => {
          const data: MindMapTreeNodeData = params.data || {}
          if (data._type === 'ROOT') return 'roundRect'
          return data._type === 'NODE' ? 'roundRect' : 'circle'
        },
        symbolSize: (_value: number, params: MindMapCallbackParams) => {
          const data: MindMapTreeNodeData = params.data || {}
          const depth = data.depth || 0
          if (data._type === 'ROOT') return [72, 36]
          if (data._type === 'NODE') return Math.max(22, 40 - depth * 4)
          return Math.max(16, 28 - depth * 2)
        },
        expandAndCollapse: true,
        initialTreeDepth: 3,
        roam: true,
        label: {
          position: 'right',
          offset: [8, 0],
          fontSize: 13,
          fontWeight: 600,
          color: '#0f172a',
          backgroundColor: 'rgba(255,255,255,0.92)',
          padding: [4, 10, 4, 10],
          borderRadius: 6,
          shadowBlur: 8,
          shadowColor: 'rgba(0,0,0,0.06)',
          formatter: (params: MindMapCallbackParams) => {
            const data: MindMapTreeNodeData = params.data || {}
            let text = `{name|${params.name}}`
            
            if (data._type === 'ROOT' || data._type === 'NODE') {
              const count = data._subCount || 0
              if (count > 0) {
                text += ` {count|${count}}`
              }
              // Only show expand/collapse icon if it has children
              if (data.children && data.children.length > 0) {
                text += params.collapsed ? ' {icon|⊕}' : ' {icon|⊖}'
              }
            }
            return text
          },
          rich: {
            name: {
              fontSize: 13,
              fontWeight: 600,
              color: '#0f172a',
            },
            count: {
              fontSize: 11,
              fontWeight: 600,
              color: '#4f46e5',
              backgroundColor: '#e0e7ff',
              padding: [2, 6, 2, 6],
              borderRadius: 10,
            },
            icon: {
              fontSize: 14,
              color: '#94a3b8',
              padding: [0, 0, 0, 2],
            },
          },
        },
        leaves: {
          label: {
            position: 'right',
            offset: [6, 0],
            fontSize: 12,
            fontWeight: 600,
            color: '#1e293b',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: [3, 8, 3, 8],
            borderRadius: 6,
          },
        },
        lineStyle: {
          color: '#c7d2fe',
          width: 1.5,
          curveness: 0.5,
        },
        emphasis: {
          focus: 'descendant' as const,
          lineStyle: {
            width: 3,
            color: '#6366f1',
          },
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(99, 102, 241, 0.4)',
          },
        },
        animationDuration: 600,
        animationEasing: 'cubicOut',
      },
    ],
  }), [mindMapData])

  // ECharts event handlers passed via onEvents prop (guaranteed to fire after chart renders)
  const chartEvents = useMemo(() => ({
    click: (params: MindMapCallbackParams) => {
      const data = params.data
      if (!data) return
      if (data._type === 'ARTICLE') {
        setContextMenu(null)
        navigate(`/article/preview/${data._articleId || data._id}`)
      }
    },
    contextmenu: (params: MindMapCallbackParams) => {
      const nativeEvent = params.event?.event as MouseEvent | undefined
      if (nativeEvent) {
        nativeEvent.preventDefault()
        nativeEvent.stopPropagation()
      }
      const data = params.data
      if (data?._type && data._type !== 'ROOT') {
        setContextMenu({
          x: nativeEvent?.clientX ?? 0,
          y: nativeEvent?.clientY ?? 0,
          type: data._type,
          id: data._id!,
          articleId: data._articleId || data._id,
          parentId: data._parentId || 0,
          name: data._label || data._fullLabel || params.name,
        })
      } else {
        setContextMenu(null)
      }
    },
  }), [navigate])

  // When chart is ready, disable the default browser context menu on the canvas
  const handleChartReady = useCallback((chart: EChartsInstance) => {
    const dom = chart.getDom() as HTMLElement
    dom.addEventListener('contextmenu', (e) => e.preventDefault())
  }, [])

  // Close menu when user clicks anywhere outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Only close if the menu is open and the click is NOT on a menu button
      // (menu buttons handle their own onClick which also calls setContextMenu(null))
      const target = e.target as HTMLElement
      if (!target.closest('[data-context-menu]')) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handleGlobalClick)
    return () => document.removeEventListener('mousedown', handleGlobalClick)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Spin size="large" />
      </div>
    )
  }

  const stats = [
    {
      label: '目录节点',
      value: totalNodes.nodes,
      icon: <FolderOpenOutlined />,
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-200/50',
    },
    {
      label: '文章总数',
      value: totalNodes.articles,
      icon: <ReadOutlined />,
      gradient: 'from-blue-400 to-indigo-500',
      shadow: 'shadow-blue-200/50',
    },
    {
      label: '最大深度',
      value: maxDepth,
      icon: <GoldOutlined />,
      gradient: 'from-violet-400 to-purple-600',
      shadow: 'shadow-violet-200/50',
    },
    {
      label: '总项目数',
      value: totalNodes.nodes + totalNodes.articles,
      icon: <NodeIndexOutlined />,
      gradient: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-200/50',
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/article/tree')}
              className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800 m-0 tracking-tight">归类可视化</h1>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  脑图模式
                </span>
              </div>
              <div className="mt-0.5">
                <Breadcrumb
                  items={[
                    { title: <Link to="/" className="text-slate-400 hover:text-slate-600 text-xs">首页</Link> },
                    { title: <Link to="/article/tree" className="text-slate-400 hover:text-slate-600 text-xs">文章归类树</Link> },
                    { title: <span className="text-xs text-slate-600">可视化</span> },
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm" />
                目录
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm" />
                文章
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded bg-gradient-to-br from-violet-400 to-indigo-500 shadow-sm" />
                根
              </span>
            </div>
            <div className="w-px h-5 bg-slate-200" />
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              size="small"
              className="rounded-lg hover:text-indigo-600 hover:border-indigo-400"
            >
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow duration-300"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md ${s.shadow} shrink-0`}>
              <span className="text-white text-lg">{s.icon}</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mind Map */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ApartmentOutlined className="text-indigo-500 text-base" />
            <span className="font-semibold text-slate-700 text-sm">归类结构脑图</span>
            <span className="text-[11px] text-slate-400 ml-1">拖拽平移 / 滚轮缩放 / 单击文章预览 / 右键更多操作</span>
          </div>
        </div>
        <div className="p-2">
          <ReactECharts
            ref={chartRef}
            option={mindMapOption}
            style={{ height: 560 }}
            notMerge
            lazyUpdate
            onEvents={chartEvents}
            onChartReady={handleChartReady}
          />
          {contextMenu && (
            <div
              data-context-menu
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 9999,
                minWidth: 210,
                background: 'rgba(255,255,255,0.97)',
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(99,102,241,0.13), 0 2px 8px rgba(0,0,0,0.10)',
                border: '1px solid rgba(226,232,240,0.8)',
                overflow: 'hidden',
                backdropFilter: 'blur(12px)',
                animation: 'ctxMenuIn 0.13s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <style>{`
                @keyframes ctxMenuIn {
                  from { opacity: 0; transform: scale(0.93) translateY(-6px); }
                  to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
                .ctx-item {
                  display: flex; align-items: center; gap: 10px;
                  width: 100%; text-align: left;
                  padding: 9px 16px;
                  font-size: 13px; font-weight: 500;
                  color: #374151;
                  background: transparent;
                  border: none; cursor: pointer;
                  transition: background 0.15s, color 0.15s, padding-left 0.15s;
                  position: relative;
                }
                .ctx-item:hover { padding-left: 20px; }
                .ctx-item.blue:hover   { background: #eff6ff; color: #2563eb; }
                .ctx-item.green:hover  { background: #f0fdf4; color: #059669; }
                .ctx-item.amber:hover  { background: #fffbeb; color: #d97706; }
                .ctx-item.red:hover    { background: #fef2f2; color: #dc2626; }
                .ctx-item.indigo:hover { background: #eef2ff; color: #4f46e5; }
                .ctx-icon-badge {
                  width: 26px; height: 26px; border-radius: 7px;
                  display: flex; align-items: center; justify-content: center;
                  flex-shrink: 0; font-size: 12px;
                }
              `}</style>

              {/* Header */}
              <div style={{
                padding: '10px 16px 9px',
                background: contextMenu.type === 'NODE'
                  ? 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)'
                  : 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
                borderBottom: '1px solid rgba(226,232,240,0.7)',
                display: 'flex', alignItems: 'center', gap: 9,
              }}>
                <div
                  className="ctx-icon-badge"
                  style={{
                    background: contextMenu.type === 'NODE'
                      ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                      : 'linear-gradient(135deg,#60a5fa,#3b82f6)',
                    boxShadow: contextMenu.type === 'NODE'
                      ? '0 2px 6px rgba(245,158,11,0.35)'
                      : '0 2px 6px rgba(59,130,246,0.35)',
                    color: '#fff',
                  }}
                >
                  {contextMenu.type === 'NODE' ? <FolderOpenOutlined /> : <FileTextOutlined />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {contextMenu.name || (contextMenu.type === 'NODE' ? '目录节点' : '文章')}
                  </div>
                  <div style={{ fontSize: 10, color: contextMenu.type === 'NODE' ? '#d97706' : '#3b82f6', fontWeight: 500, marginTop: 1 }}>
                    {contextMenu.type === 'NODE' ? '📁 目录节点' : '📄 文章'}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '4px 0' }}>
                {contextMenu.type === 'ARTICLE' ? (
                  <>
                    <button
                      className="ctx-item blue"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => { navigate(`/article/edit/${contextMenu.articleId}`); setContextMenu(null) }}
                    >
                      <div className="ctx-icon-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <EditOutlined />
                      </div>
                      编辑文章
                    </button>
                    <button
                      className="ctx-item green"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => { navigate(`/article/preview/${contextMenu.articleId}`); setContextMenu(null) }}
                    >
                      <div className="ctx-icon-badge" style={{ background: '#f0fdf4', color: '#059669' }}>
                        <FileTextOutlined />
                      </div>
                      预览文章
                    </button>
                    {(contextMenu.parentId ?? 0) > 0 && (
                      <>
                        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#e2e8f0,transparent)', margin: '4px 12px' }} />
                        <button
                          className="ctx-item amber"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => { handleMoveToRoot(contextMenu.articleId!); setContextMenu(null) }}
                        >
                          <div className="ctx-icon-badge" style={{ background: '#fffbeb', color: '#d97706' }}>
                            <ExportOutlined />
                          </div>
                          移至根目录
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    className="ctx-item red"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => { handleDeleteNode(contextMenu.id, contextMenu.name); setContextMenu(null) }}
                  >
                    <div className="ctx-icon-badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
                      <DeleteOutlined />
                    </div>
                    删除节点
                  </button>
                )}
              </div>

              {/* Footer hint */}
              <div style={{
                padding: '6px 16px 8px',
                borderTop: '1px solid rgba(226,232,240,0.6)',
                fontSize: 10,
                color: '#94a3b8',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block', flexShrink: 0 }} />
                点击空白处关闭菜单
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Directory List */}
      {treeItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <FolderOutlined className="text-amber-500 text-base" />
            <span className="font-semibold text-slate-700 text-sm">目录结构总览</span>
            <span className="text-[11px] text-slate-400 ml-1">{totalNodes.nodes + totalNodes.articles} 项</span>
          </div>
          <div className="p-5">
            <div className="space-y-1">
              {renderTreeList(treeItems, 0, navigate)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const renderTreeList = (items: ArticleDirectoryItem[], depth = 0, navigate?: ReturnType<typeof useNavigate>): React.ReactNode[] => {
  const nodes: React.ReactNode[] = []
  items.forEach((item) => {
    const isNode = item.type === 'NODE'
    const label = isNode ? item.name || '未命名' : item.title || '未命名'

    nodes.push(
      <div
        key={item.key}
        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
          !isNode ? 'hover:bg-blue-50/60 cursor-pointer hover:shadow-sm' : 'hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${depth * 28 + 16}px` }}
        {...(!isNode && navigate ? {
          onClick: () => navigate(`/article/preview/${item.articleId || item.id}`),
        } : {})}
      >
        {/* Left side: Icon + Title + Meta */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isNode ? (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shrink-0">
              {item.children?.length ? (
                <FolderOpenOutlined className="text-white text-[13px]" />
              ) : (
                <FolderOutlined className="text-white text-[13px]" />
              )}
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${
              item.status === 1
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                : 'bg-gradient-to-br from-blue-400 to-indigo-500'
            }`}>
              <FileTextOutlined className="text-white text-[13px]" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[14px] truncate ${isNode ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                {label}
              </span>
              {!isNode && item.categoryName && (
                <span className="shrink-0 text-[10px] text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
                  {item.categoryName}
                </span>
              )}
              {!isNode && item.status !== undefined && (
                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${
                  item.status === 1 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-100 border-slate-200'
                }`}>
                  {item.status === 1 ? '已发布' : '草稿'}
                </span>
              )}
            </div>
            
            {/* Sub-info row for extra details */}
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-medium">
              {!isNode && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="text-slate-300">ID:</span>{item.articleId || item.id}</span>
                  {item.articleKey && <span className="flex items-center gap-1"><span className="text-slate-300">Key:</span>{item.articleKey}</span>}
                  {item.updateTime && <span className="flex items-center gap-1"><span className="text-slate-300">更新:</span>{item.updateTime.slice(0, 10)}</span>}
                </div>
              )}
              {isNode && (
                <span className="text-slate-400">Node Key: {item.key}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Actions / Stats */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {isNode && item.children && (
            <Tooltip title={`包含 ${countArticles(item.children)} 篇文章`}>
              <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold border border-indigo-100 opacity-80 group-hover:opacity-100 transition-opacity">
                {countArticles(item.children)} 篇
              </span>
            </Tooltip>
          )}
          {!isNode && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Tooltip title="编辑" mouseEnterDelay={0.4}>
                <Button
                  type="text"
                  size="small"
                  className="flex items-center justify-center p-0.5 h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg"
                  icon={<EditOutlined className="text-[12px]" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate?.(`/article/edit/${item.articleId || item.id}`)
                  }}
                />
              </Tooltip>
              <Tooltip title="预览" mouseEnterDelay={0.4}>
                <Button
                  type="text"
                  size="small"
                  className="flex items-center justify-center p-0.5 h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg"
                  icon={<FileTextOutlined className="text-[12px]" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate?.(`/article/preview/${item.articleId || item.id}`)
                  }}
                />
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    )

    if (item.children?.length) {
      nodes.push(...renderTreeList(item.children, depth + 1, navigate))
    }
  })
  return nodes
}

export default StatisticsPage
