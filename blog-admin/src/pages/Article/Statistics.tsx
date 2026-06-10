import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Breadcrumb, Spin, Tag, Tooltip } from 'antd'
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
} from '@ant-design/icons'
import { Button, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  getArticleDirectoryTree,
  ArticleDirectoryItem,
  moveArticleDirectoryItem,
} from '@/api/articleDirectory'

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

const countNodes = (items: ArticleDirectoryItem[]): number => {
  let count = 0
  for (const item of items) {
    if (item.type === 'NODE') count++
    if (item.children?.length) count += countNodes(item.children)
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

const buildEChartsTreeData = (items: ArticleDirectoryItem[], depth = 0): any[] => {
  return items.map((item) => {
    const isNode = item.type === 'NODE'
    const label = isNode ? item.name || '未命名' : item.title || '未命名'
    const subCount = isNode && item.children ? countArticles(item.children) : 0
    const truncated = label.length > 14 ? `${label.slice(0, 12)}…` : label

    const colorIdx = depth % NODE_GRADIENTS.length

    return {
      name: truncated,
      _label: label,
      _fullLabel: label,
      _type: item.type,
      _id: item.id,
      _articleId: item.articleId,
      _parentId: item.parentId,
      _subCount: subCount,
      _categoryName: item.categoryName,
      _status: item.status,
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
  const lastHoveredArticle = useRef<{ articleId: number; parentId: number } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; articleId: number; parentId: number } | null>(null)

  const handleChartClick = useCallback((params: any) => {
    setContextMenu(null)
    const data = params.data
    if (!data) return
    if (data._type === 'ARTICLE') {
      navigate(`/article/preview/${data._articleId || data._id}`)
    }
  }, [navigate])

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
  }, [])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getArticleDirectoryTree()
      setTreeItems(data)
    } catch (error) {
      console.error('加载归类树失败', error)
    } finally {
      setLoading(false)
    }
  }

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

  const mindMapOption = {
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 16],
      extraCssText: 'border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);',
      textStyle: { color: '#1e293b', fontSize: 13 },
      formatter: (params: any) => {
        const data = params.data || {}
        const isNode = data._type === 'NODE'
        const isRoot = data._type === 'ROOT'
        let html = `<div style="line-height:1.8">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:#1e293b">${data._fullLabel || params.name}</div>`
        if (isRoot) {
          html += `<div style="color:#6366f1;font-weight:500">🏠 根目录</div>`
        } else if (isNode) {
          html += `<div style="color:#f59e0b;font-weight:500">📁 目录节点</div>`
          if (data._subCount > 0) {
            html += `<div style="color:#64748b">包含 <b>${data._subCount}</b> 篇文章</div>`
          }
        } else {
          html += `<div style="color:#3b82f6;font-weight:500">📄 文章</div>`
          if (data._categoryName) {
            html += `<div style="color:#64748b">分类：${data._categoryName}</div>`
          }
          if (data._status !== undefined) {
            html += `<div style="color:#64748b">状态：${data._status === 1 ? '已发布' : '草稿'}</div>`
          }
          html += `<div style="margin-top:8px;padding-top:6px;border-top:1px solid #f1f5f9;display:flex;gap:6px">
            <span style="font-size:11px;color:#6366f1;cursor:pointer" data-action="edit" data-id="${data._articleId || data._id}">✏️ 编辑</span>
            <span style="font-size:11px;color:#059669;cursor:pointer" data-action="preview" data-id="${data._articleId || data._id}">👁 预览</span>
          </div>`
        }
        html += '</div>'
        return html
      },
    },
    series: [
      {
        type: 'tree',
        data: [mindMapData],
        top: '6%',
        left: '12%',
        bottom: '6%',
        right: '16%',
        layout: 'radial',
        symbol: (_value: number, params: any) => {
          const data = params.data || {}
          if (data._type === 'ROOT') return 'roundRect'
          return data._type === 'NODE' ? 'roundRect' : 'circle'
        },
        symbolSize: (_value: number, params: any) => {
          const data = params.data || {}
          const depth = data.depth || 0
          if (data._type === 'ROOT') return [72, 36]
          if (data._type === 'NODE') return Math.max(22, 40 - depth * 4)
          return Math.max(12, 24 - depth * 2)
        },
        expandAndCollapse: true,
        initialTreeDepth: 3,
        roam: true,
        label: {
          position: 'radial',
          offset: [0, 12],
          fontSize: 11,
          fontWeight: 500,
          color: '#475569',
          textShadowBlur: 4,
          textShadowColor: 'rgba(255,255,255,0.95)',
          formatter: (params: any) => {
            return params.name
          },
        },
        leaves: {
          label: {
            position: 'radial',
            offset: [0, 8],
            fontSize: 10,
            color: '#64748b',
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
  }

  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance()
    if (!chart) return

    chart.on('click', handleChartClick)

    // Track hovered article nodes for right-click context menu
    chart.on('mouseover', (params: any) => {
      const data = params.data
      if (data?._type === 'ARTICLE') {
        lastHoveredArticle.current = {
          articleId: data._articleId || data._id,
          parentId: data._parentId || 0,
        }
      } else {
        lastHoveredArticle.current = null
      }
    })
    chart.on('mouseout', () => {
      lastHoveredArticle.current = null
    })

    // Prevent default browser context menu on the chart
    const dom = chart.getDom()
    const onCtx = (e: MouseEvent) => {
      e.preventDefault()
      const info = lastHoveredArticle.current
      if (info) {
        setContextMenu({ x: e.clientX, y: e.clientY, ...info })
      } else {
        setContextMenu(null)
      }
    }
    dom.addEventListener('contextmenu', onCtx)

    return () => {
      chart.off('click', handleChartClick)
      dom.removeEventListener('contextmenu', onCtx)
    }
  }, [mindMapOption, handleChartClick])

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
        <div className="p-2" onClick={() => setContextMenu(null)}>
          <ReactECharts ref={chartRef} option={mindMapOption} style={{ height: 560 }} notMerge lazyUpdate />
          {contextMenu && (
            <div
              className="fixed z-50 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 min-w-[160px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => { navigate(`/article/edit/${contextMenu.articleId}`); setContextMenu(null) }}
              >
                ✏️ 编辑文章
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                onClick={() => { navigate(`/article/preview/${contextMenu.articleId}`); setContextMenu(null) }}
              >
                👁 预览文章
              </button>
              {contextMenu.parentId > 0 && (
                <>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    onClick={() => { handleMoveToRoot(contextMenu.articleId); setContextMenu(null) }}
                  >
                    ↗ 移至根目录
                  </button>
                </>
              )}
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
        className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-200 ${
          !isNode ? 'hover:bg-blue-50/60 cursor-pointer' : 'hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
        {...(!isNode && navigate ? {
          onClick: () => navigate(`/article/preview/${item.articleId || item.id}`),
        } : {})}
      >
        {isNode ? (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shrink-0">
            {item.children?.length ? (
              <FolderOpenOutlined className="text-white text-xs" />
            ) : (
              <FolderOutlined className="text-white text-xs" />
            )}
          </div>
        ) : (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${
            item.status === 1
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
              : 'bg-gradient-to-br from-blue-400 to-indigo-500'
          }`}>
            <FileTextOutlined className="text-white text-xs" />
          </div>
        )}
        <span className={`text-sm truncate flex-1 ${isNode ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
          {label}
        </span>
        {!isNode && item.categoryName && (
          <Tag className="shrink-0 text-[10px] leading-4 rounded-full border-0" color="cyan">
            {item.categoryName}
          </Tag>
        )}
        {!isNode && item.status !== undefined && (
          <Tag
            className="shrink-0 text-[10px] leading-4 rounded-full border-0"
            color={item.status === 1 ? 'green' : 'default'}
          >
            {item.status === 1 ? '已发布' : '草稿'}
          </Tag>
        )}
        {isNode && item.children && (
          <Tooltip title={`${countArticles(item.children)} 篇文章`}>
            <span className="shrink-0 text-[10px] text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-full font-medium border border-slate-200/60">
              {countArticles(item.children)}
            </span>
          </Tooltip>
        )}
        {!isNode && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Tooltip title="编辑" mouseEnterDelay={0.4}>
              <Button
                type="text"
                size="small"
                className="flex items-center justify-center p-0.5 h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg"
                icon={<EditOutlined className="text-[11px]" />}
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
                className="flex items-center justify-center p-0.5 h-6 w-6 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg"
                icon={<FileTextOutlined className="text-[11px]" />}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate?.(`/article/preview/${item.articleId || item.id}`)
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>
    )
    if (item.children?.length) {
      nodes.push(...renderTreeList(item.children, depth + 1, navigate))
    }
  })
  return nodes
}

export default StatisticsPage
