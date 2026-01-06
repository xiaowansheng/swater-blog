import React from 'react'
import { Tooltip } from 'antd'
import {
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  CloudOutlined,
} from '@ant-design/icons'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface TalkSaveStatusProps {
  status: SaveStatus
  lastSavedTime?: Date
  errorMessage?: string
}

const TalkSaveStatus: React.FC<TalkSaveStatusProps> = ({
  status,
  lastSavedTime,
  errorMessage,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: <CloudOutlined className="text-gray-400" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          text: '未保存',
        }
      case 'saving':
        return {
          icon: <SyncOutlined spin className="text-blue-500" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          text: '保存中...',
        }
      case 'saved':
        return {
          icon: <CheckCircleOutlined className="text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          text: '已保存',
        }
      case 'error':
        return {
          icon: <ExclamationCircleOutlined className="text-red-500" />,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          text: '保存失败',
        }
      default:
        return {
          icon: <CloudOutlined className="text-gray-400" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          text: '未保存',
        }
    }
  }

  const config = getStatusConfig()

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const tooltipContent = (
    <div className="text-sm">
      <div>{config.text}</div>
      {lastSavedTime && status === 'saved' && (
        <div className="text-gray-400 text-xs mt-1">
          保存时间: {lastSavedTime.toLocaleString('zh-CN')}
        </div>
      )}
      {errorMessage && status === 'error' && (
        <div className="text-red-400 text-xs mt-1">{errorMessage}</div>
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
        <span className="hidden sm:inline">
          {status === 'saved' && lastSavedTime
            ? `已保存 ${formatTime(lastSavedTime)}`
            : config.text}
        </span>
      </div>
    </Tooltip>
  )
}

export default TalkSaveStatus
