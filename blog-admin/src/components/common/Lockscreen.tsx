import { Modal, Input, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useLockscreenStore } from '@/store/lockscreen'

const Lockscreen: React.FC = () => {
  const { isLocked, unlockScreen } = useLockscreenStore()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLocked) {
      setPassword('')
      setError('')
    }
  }, [isLocked])

  const handleUnlock = () => {
    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    const success = unlockScreen(password)
    if (success) {
      message.success('解锁成功')
      setPassword('')
      setError('')
    } else {
      setError('密码错误')
      message.error('密码错误')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  return (
    <Modal
      open={isLocked}
      title={null}
      footer={null}
      closable={false}
      centered
      maskClosable={false}
      width={400}
      className="lockscreen-modal"
    >
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full">
            <LockOutlined className="text-4xl text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">屏幕已锁定</h2>
        <p className="text-gray-500 mb-6">请输入密码以解锁系统</p>
        <Input.Password
          size="large"
          placeholder="请输入密码"
          prefix={<LockOutlined className="text-gray-400" />}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          onKeyPress={handleKeyPress}
          status={error ? 'error' : ''}
          autoFocus
          className="mb-2"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleUnlock}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          解锁
        </button>
      </div>
    </Modal>
  )
}

export default Lockscreen
