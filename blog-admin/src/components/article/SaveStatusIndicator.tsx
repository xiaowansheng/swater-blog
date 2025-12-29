import React from 'react'
import { Tooltip, Spin, Badge } from 'antd'
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  ExclamationCircleOutlined,
  CloudOutlined,
  DisconnectOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { SaveStatus, SaveState } from '@/hooks/useArticleAutoSave'

interface SaveStatusIndicatorProps {
  saveState: SaveState
  statusText: string
  onRetry?: () => void
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  saveState,
  statusText,
  onRetry,
}) => {
  const getStatusConfig = () => {
    switch (saveState.status) {
      case SaveStatus.IDLE:
        return {
          icon: <CloudOutlined className="text-gray-400" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
        }
      case SaveStatus.PENDING:
        return {
          icon: <SyncOutlined className="text-blue-400" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
        }
      case SaveStatus.SAVING:
        return {
          icon: <Spin size="small" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
        }
      case SaveStatus.SAVED:
        return {
          icon: <CheckCircleOutlined className="text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        }
      case SaveStatus.ERROR:
        return {
          icon: <ExclamationCircleOutlined className="text-red-500" />,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
        }
      case SaveStatus.CONFLICT:
        return {
          icon: <WarningOutlined className="text-orange-500" />,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
        }
      case SaveStatus.OFFLINE:
        return {
          icon: <DisconnectOutlined className="text-gray-500" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
        }
      default:
        return {
          icon: <CloudOutlined className="text-gray-400" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
        }
    }
  }

  const config = getStatusConfig()

  const tooltipContent = (
    <div className="text-sm">
      <div>{statusText}</div>
      {saveState.lastSavedTime && (
        <div className="text-gray-400 text-xs mt-1">
          上次保存: {saveState.lastSavedTime.toLocaleString()}
        </div>
      )}
      {saveState.errorMessage && saveState.status === SaveStatus.ERROR && (
        <div className="text-red-400 text-xs mt-1">
          {saveState.errorMessage}
          {onRetry && (
            <span 
              className="ml-2 text-blue-400 cursor-pointer hover:underline"
              onClick={onRetry}
            >
              点击重试
            </span>
          )}
        </div>
      )}
      {saveState.status === SaveStatus.CONFLICT && (
        <div className="text-orange-400 text-xs mt-1">
          文章已被其他用户修改，请刷新页面或选择覆盖
        </div>
      )}
    </div>
  )

  return (
    <Tooltip title={tooltipContent} placement="bottom">
      <div 
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
          ${config.bgColor} ${config.color} text-sm cursor-default
          transition-all duration-200
        `}
      >
        {config.icon}
        <span className="hidden sm:inline">{statusText}</span>
      </div>
    </Tooltip>
  )
}

export default SaveStatusIndicator
