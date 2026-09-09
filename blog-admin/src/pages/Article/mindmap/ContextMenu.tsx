import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export interface MindMapContextMenuState {
  x: number
  y: number
  type: 'NODE' | 'ARTICLE'
  id: number
  articleId?: number
  parentId?: number
  name?: string
}

interface ContextMenuProps {
  menu: MindMapContextMenuState
  navigate: ReturnType<typeof useNavigate>
  onMoveToRoot: (articleId: number) => void
  onDeleteNode: (nodeId: number, name?: string) => void
  onClose: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  menu,
  navigate,
  onMoveToRoot,
  onDeleteNode,
  onClose,
}) => {
  return (
    <div
      data-context-menu
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: menu.x,
        top: menu.y,
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
        background: menu.type === 'NODE'
          ? 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)'
          : 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
        borderBottom: '1px solid rgba(226,232,240,0.7)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <div
          className="ctx-icon-badge"
          style={{
            background: menu.type === 'NODE'
              ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
              : 'linear-gradient(135deg,#60a5fa,#3b82f6)',
            boxShadow: menu.type === 'NODE'
              ? '0 2px 6px rgba(245,158,11,0.35)'
              : '0 2px 6px rgba(59,130,246,0.35)',
            color: '#fff',
          }}
        >
          {menu.type === 'NODE' ? <FolderOpenOutlined /> : <FileTextOutlined />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {menu.name || (menu.type === 'NODE' ? '目录节点' : '文章')}
          </div>
          <div style={{ fontSize: 10, color: menu.type === 'NODE' ? '#d97706' : '#3b82f6', fontWeight: 500, marginTop: 1 }}>
            {menu.type === 'NODE' ? '📁 目录节点' : '📄 文章'}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: '4px 0' }}>
        {menu.type === 'ARTICLE' ? (
          <>
            <button
              className="ctx-item blue"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { navigate(`/article/edit/${menu.articleId}`); onClose() }}
            >
              <div className="ctx-icon-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <EditOutlined />
              </div>
              编辑文章
            </button>
            <button
              className="ctx-item green"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { navigate(`/article/preview/${menu.articleId}`); onClose() }}
            >
              <div className="ctx-icon-badge" style={{ background: '#f0fdf4', color: '#059669' }}>
                <FileTextOutlined />
              </div>
              预览文章
            </button>
            {(menu.parentId ?? 0) > 0 && (
              <>
                <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#e2e8f0,transparent)', margin: '4px 12px' }} />
                <button
                  className="ctx-item amber"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => { onMoveToRoot(menu.articleId!); onClose() }}
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
            onClick={() => { onDeleteNode(menu.id, menu.name); onClose() }}
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
  )
}

export default ContextMenu
