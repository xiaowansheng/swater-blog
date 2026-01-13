import React, { useState } from 'react'
import { Modal, Form, Input, Button, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'
import { useNavigate } from 'react-router-dom'
import * as authApi from '@/api/auth'
import ForgotPasswordModal from './ForgotPasswordModal'

const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, login, loginWithEmail } = useAuthStore()
  const { restoreTabs, clearCachedTabs, cachedTabs } = useTabsStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('password')
  const [countdown, setCountdown] = useState(0)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [passwordForm] = Form.useForm()
  const [emailForm] = Form.useForm()

  // 密码登录
  const handlePasswordLogin = async (values: any) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      setLoginModalOpen(false)
      passwordForm.resetFields()
      
      // 检查是否有缓存的标签页
      if (cachedTabs.length > 0) {
        console.log('模态框登录 - 发现缓存的标签页，准备恢复:', cachedTabs)
        // 恢复标签页
        restoreTabs()
        // 跳转到第一个缓存的标签页
        const firstTab = cachedTabs[0]
        navigate(firstTab.path, { replace: true })
        // 清除缓存
        clearCachedTabs()
      }
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 发送验证码
  const handleSendCode = async () => {
    const email = emailForm.getFieldValue('email')
    if (!email) {
      message.warning('请先输入邮箱')
      return
    }

    setLoading(true)
    try {
      await authApi.sendEmailCode({ email, type: 'login' })
      message.success('验证码已发送到您的邮箱')
      startCountdown()
    } catch (error: any) {
      message.error(error.message || '发送失败')
    } finally {
      setLoading(false)
    }
  }

  // 倒计时
  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 邮箱验证码登录
  const handleEmailLogin = async (values: any) => {
    setLoading(true)
    try {
      await loginWithEmail(values.email, values.code)
      message.success('登录成功')
      setLoginModalOpen(false)
      emailForm.resetFields()
      setCountdown(0)
      
      // 检查是否有缓存的标签页
      if (cachedTabs.length > 0) {
        console.log('邮箱登录 - 发现缓存的标签页，准备恢复:', cachedTabs)
        // 恢复标签页
        restoreTabs()
        // 跳转到第一个缓存的标签页
        const firstTab = cachedTabs[0]
        navigate(firstTab.path, { replace: true })
        // 清除缓存
        clearCachedTabs()
      }
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    passwordForm.resetFields()
    emailForm.resetFields()
    setCountdown(0)
    setLoginModalOpen(false)
  }

  const handleForgotPassword = () => {
    console.log('handleForgotPassword 被调用')
    console.log('当前 forgotPasswordOpen 状态:', forgotPasswordOpen)
    setForgotPasswordOpen(true)
    console.log('已调用 setForgotPasswordOpen(true)')
  }

  const tabItems = [
    {
      key: 'password',
      label: '密码登录',
      children: (
        <div>
          <Form
            form={passwordForm}
            name="password_login"
            onFinish={handlePasswordLogin}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="h-12 bg-gradient-to-r from-blue-500 to-purple-600 border-none"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          <div className="flex justify-end mt-4">
            <Button
              type="link"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('按钮被点击了！')
                handleForgotPassword()
              }}
              className="h-auto text-blue-500 hover:text-blue-600"
              style={{ padding: '4px 8px', minHeight: '32px', minWidth: '80px' }}
            >
              忘记密码？
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: '邮箱登录',
      children: (
        <Form
          form={emailForm}
          name="email_login"
          onFinish={handleEmailLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="邮箱"
            />
          </Form.Item>
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <div className="flex gap-2">
              <Input
                prefix={<SafetyOutlined className="text-gray-400" />}
                placeholder="验证码"
                className="flex-1"
              />
              <Button
                disabled={countdown > 0}
                onClick={handleSendCode}
                loading={loading}
                style={{ minWidth: '120px' }}
              >
                {countdown > 0 ? `${countdown}秒` : '发送验证码'}
              </Button>
            </div>
          </Form.Item>
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="h-12 bg-gradient-to-r from-blue-500 to-purple-600 border-none"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <>
      <Modal
        title="登录已过期"
        open={isLoginModalOpen}
        onCancel={handleClose}
        footer={null}
        closable={false}
        maskClosable={false}
        centered
        width={450}
      >
        <div className="py-4">
          <p className="text-gray-500 mb-6 text-center">您的登录已过期，请重新登录以继续操作。</p>
          <Tabs
            activeKey={loginType}
            onChange={setLoginType}
            items={tabItems}
            centered
          />
        </div>
      </Modal>

      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </>
  )
}

export default LoginModal
