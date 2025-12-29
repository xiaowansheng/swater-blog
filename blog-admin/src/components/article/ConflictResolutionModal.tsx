import React from 'react'
import { Modal, Button, Space, Alert, Tabs, Typography } from 'antd'
import { ExclamationCircleOutlined, CloudDownloadOutlined, CloudUploadOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

interface ConflictResolutionModalProps {
  visible: boolean
  localContent: string
  serverContent: string
  serverUpdateTime: string
  onUseServer: () => void
  onUseLocal: () => void
  onCancel: () => void
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  localContent,
  serverContent,
  serverUpdateTime,
  onUseServer,
  onUseLocal,
  onCancel,
}) => {
  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleString()
    } catch {
      return timeStr
    }
  }

  const truncateContent = (content: string, maxLength: number = 500) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const tabItems = [
    {
      key: 'local',
      label: (
        <span className="flex items-center gap-1">
          <CloudUploadOutlined />
          本地版本
        </span>
      ),
      children: (
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-auto">
          <Paragraph className="whitespace-pre-wrap text-sm text-gray-700 m-0">
            {truncateContent(localContent)}
          </Paragraph>
        </div>
      ),
    },
    {
      key: 'server',
      label: (
        <span className="flex items-center gap-1">
          <CloudDownloadOutlined />
          服务器版本
        </span>
      ),
      children: (
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-auto">
          <div className="text-xs text-gray-500 mb-2">
            更新时间: {formatTime(serverUpdateTime)}
          </div>
          <Paragraph className="whitespace-pre-wrap text-sm text-gray-700 m-0">
            {truncateContent(serverContent)}
          </Paragraph>
        </div>
      ),
    },
  ]

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-orange-500">
          <ExclamationCircleOutlined />
          <span>检测到版本冲突</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={null}
      maskClosable={false}
    >
      <div className="py-4">
        <Alert
          type="warning"
          showIcon
          message="文章已被其他用户修改"
          description="您正在编辑的文章在服务器上已有更新版本。请选择保留哪个版本，或取消后手动合并内容。"
          className="mb-4"
        />

        <Tabs items={tabItems} className="mb-4" />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button 
            icon={<CloudDownloadOutlined />}
            onClick={onUseServer}
          >
            使用服务器版本
          </Button>
          <Button 
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={onUseLocal}
            danger
          >
            覆盖服务器版本
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <Text type="secondary">
            提示：选择"使用服务器版本"将丢弃您的本地修改；选择"覆盖服务器版本"将用您的本地内容替换服务器上的内容。
          </Text>
        </div>
      </div>
    </Modal>
  )
}

export default ConflictResolutionModal
