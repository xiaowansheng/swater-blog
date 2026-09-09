import type { DataNode } from 'antd/es/tree'
import type { ArticleDirectoryItem } from '@/api/articleDirectory'

export interface DirectoryTreeDataNode extends DataNode {
  item: ArticleDirectoryItem
  children?: DirectoryTreeDataNode[]
}

export interface DirectorySelectOption {
  title?: string
  value: number
  key: string | number
  disabled?: boolean
  children?: DirectorySelectOption[]
}

// 顶级节点直接作为树的顶层显示，根节点(id=0)隐式存在，不再用虚拟 ROOT 节点包裹。
export const customTreeStyles = `
.custom-directory-tree.ant-tree {
  background: transparent;
}
.custom-directory-tree .ant-tree-treenode {
  padding: 3px 0 !important;
  width: 100%;
  align-items: center;
  position: relative;
}
.custom-directory-tree .ant-tree-treenode::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0 10%, #e2e8f0 90%, transparent);
  opacity: 0;
  transition: opacity 0.2s;
}
.custom-directory-tree .ant-tree-treenode:hover::before {
  opacity: 0;
}
.custom-directory-tree .ant-tree-node-content-wrapper {
  padding: 4px 6px !important;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.custom-directory-tree .ant-tree-node-content-wrapper > * {
  flex: 1;
  min-width: 0;
}
.custom-directory-tree .ant-tree-node-content-wrapper:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.custom-directory-tree .ant-tree-node-selected {
  background: linear-gradient(135deg, #eff6ff, #e0f2fe) !important;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.08);
}
.custom-directory-tree .ant-tree-node-selected .dir-node-name {
  color: #1e40af !important;
  font-weight: 600;
}
.custom-directory-tree .ant-tree-node-selected .dir-icon-wrap {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}
.custom-directory-tree .ant-tree-node-selected .dir-icon-wrap .anticon {
  color: #fff !important;
}
.custom-directory-tree .ant-tree-node-selected .article-icon-wrap {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}
.custom-directory-tree .ant-tree-node-selected .article-icon-wrap .anticon {
  color: #fff !important;
}
.custom-directory-tree .ant-tree-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
}
.custom-directory-tree .ant-tree-switcher-icon {
  transform: none !important;
}
.custom-directory-tree .ant-tree-indent-unit {
  width: 24px;
}
.custom-directory-tree .ant-tree-list-holder-inner {
  gap: 2px;
}
/* Tree line styling */
.custom-directory-tree .ant-tree-switcher-line-icon {
  color: #cbd5e1;
}

/* Operation buttons show on hover style */
.custom-directory-tree .tree-node-operations {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.custom-directory-tree .ant-tree-treenode:hover .tree-node-operations {
  opacity: 1;
  pointer-events: auto;
}
`
