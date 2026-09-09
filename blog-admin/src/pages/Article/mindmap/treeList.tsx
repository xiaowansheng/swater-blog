import { Button, Tooltip } from 'antd'
import {
  EditOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ArticleDirectoryItem } from '@/api/articleDirectory'
import { countArticles } from './treeData'

export const renderTreeList = (items: ArticleDirectoryItem[], depth = 0, navigate?: ReturnType<typeof useNavigate>): React.ReactNode[] => {
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
