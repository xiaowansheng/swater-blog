import type { ArticleDirectoryItem } from '@/api/articleDirectory'

export interface MindMapTreeNodeData {
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

export interface MindMapCallbackParams {
  name?: string
  collapsed?: boolean
  data?: MindMapTreeNodeData
  event?: { event?: Event }
}

export const NODE_GRADIENTS = [
  ['#fbbf24', '#f59e0b'],
  ['#fb923c', '#ea580c'],
  ['#f87171', '#dc2626'],
  ['#a78bfa', '#7c3aed'],
  ['#34d399', '#059669'],
]

export const ARTICLE_COLORS = ['#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#67e8f9']

export const countArticles = (items: ArticleDirectoryItem[]): number => {
  let count = 0
  for (const item of items) {
    if (item.type === 'ARTICLE') count++
    if (item.children?.length) count += countArticles(item.children)
  }
  return count
}

export const getMaxDepth = (items: ArticleDirectoryItem[], depth = 0): number => {
  let max = depth
  for (const item of items) {
    if (item.children?.length) {
      max = Math.max(max, getMaxDepth(item.children, depth + 1))
    }
  }
  return max
}

export const buildEChartsTreeData = (items: ArticleDirectoryItem[], depth = 0): MindMapTreeNodeData[] => {
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
