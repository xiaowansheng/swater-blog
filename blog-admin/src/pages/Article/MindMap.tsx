import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Breadcrumb, Button, Modal, Spin, message } from 'antd'
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  GoldOutlined,
  NodeIndexOutlined,
  ReadOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import ReactECharts, { EChartsInstance } from 'echarts-for-react'
import {
  getArticleDirectoryTree,
  ArticleDirectoryItem,
  moveArticleDirectoryItem,
  deleteDirectoryNode,
} from '@/api/articleDirectory'
import ContextMenu from './mindmap/ContextMenu'
import type { MindMapContextMenuState } from './mindmap/ContextMenu'
import { buildEChartsTreeData, getMaxDepth } from './mindmap/treeData'
import type { MindMapCallbackParams, MindMapTreeNodeData } from './mindmap/treeData'
import { renderTreeList } from './mindmap/treeList'

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate()
  const [treeItems, setTreeItems] = useState<ArticleDirectoryItem[]>([])
  const chartRef = useRef<ReactECharts>(null)

  const [contextMenu, setContextMenu] = useState<MindMapContextMenuState | null>(null)

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
            <ContextMenu
              menu={contextMenu}
              navigate={navigate}
              onMoveToRoot={handleMoveToRoot}
              onDeleteNode={handleDeleteNode}
              onClose={() => setContextMenu(null)}
            />
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

export default StatisticsPage
