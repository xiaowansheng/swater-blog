import React from 'react'
import { Modal, Button, Space } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'

interface LoginExpiredModalProps {
  open: boolean
  onClose: () => void
}

const LoginExpiredModal: React.FC<LoginExpiredModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { cacheTabs } = useTabsStore()

  const handleGoToLogin = async () => {
    onClose()
    // 缓存当前打开的标签页
    cacheTabs()
    // 清除所有登录信息
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-orange-500" />
          <span>登录已过期</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      maskClosable={false}
    >
      <div className="py-4">
        <p className="text-gray-600 mb-6">
          您的登录状态已过期，为了保护您的账户安全，请重新登录。
        </p>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>
            稍后处理
          </Button>
          <Button 
            type="primary" 
            onClick={handleGoToLogin}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
          >
            立即登录
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default LoginExpiredModal