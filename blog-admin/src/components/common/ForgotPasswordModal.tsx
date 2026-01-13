import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message, Steps } from 'antd'
import { MailOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons'
import * as authApi from '@/api/auth'

const { Step } = Steps

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [form] = Form.useForm()

  console.log('ForgotPasswordModal 渲染, open:', open)

  useEffect(() => {
    console.log('ForgotPasswordModal open 状态变化:', open)
    if (open) {
      console.log('忘记密码模态框应该显示')
    } else {
      console.log('忘记密码模态框应该隐藏')
    }
  }, [open])

  // 发送验证码倒计时
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

  // 发送验证码
  const handleSendCode = async () => {
    const emailValue = form.getFieldValue('email')
    if (!emailValue) {
      message.warning('请先输入邮箱')
      return
    }

    setLoading(true)
    try {
      await authApi.sendEmailCode({ email: emailValue, type: 'reset' })
      setEmail(emailValue)
      message.success('验证码已发送到您的邮箱')
      startCountdown()
      setCurrentStep(1)
    } catch (error: any) {
      message.error(error.message || '发送失败')
    } finally {
      setLoading(false)
    }
  }

  // 重置密码
  const handleResetPassword = async (values: any) => {
    setLoading(true)
    try {
      await authApi.resetPassword({
        email: email,
        code: values.code,
        newPassword: values.newPassword,
      })
      message.success('密码重置成功，请使用新密码登录')
      form.resetFields()
      setCurrentStep(0)
      setEmail('')
      setCountdown(0)
      onClose()
    } catch (error: any) {
      message.error(error.message || '重置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setCurrentStep(0)
    setEmail('')
    setCountdown(0)
    onClose()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form form={form} layout="vertical">
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="请输入您的邮箱"
                size="large"
              />
            </Form.Item>
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                onClick={() => form.validateFields().then(handleSendCode)}
                loading={loading}
              >
                发送验证码
              </Button>
            </Form.Item>
          </Form>
        )

      case 1:
        return (
          <Form form={form} layout="vertical" onFinish={handleResetPassword}>
            <Form.Item
              label="验证码"
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <div className="flex gap-2">
                <Input
                  prefix={<SafetyOutlined className="text-gray-400" />}
                  placeholder="请输入邮箱验证码"
                  size="large"
                  className="flex-1"
                />
                <Button
                  size="large"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  loading={loading}
                  style={{ minWidth: '120px' }}
                >
                  {countdown > 0 ? `${countdown}秒` : '重新发送'}
                </Button>
              </div>
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入新密码（至少6位）"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="确认密码"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请再次输入新密码"
                size="large"
              />
            </Form.Item>
            <div className="flex gap-2">
              <Button size="large" onClick={() => setCurrentStep(0)} block>
                上一步
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
              >
                重置密码
              </Button>
            </div>
          </Form>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      title="忘记密码"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      centered
    >
      <div className="py-6">
        <Steps current={currentStep} className="mb-8">
          <Step title="验证邮箱" />
          <Step title="重置密码" />
        </Steps>
        {renderStepContent()}
      </div>
    </Modal>
  )
}

export default ForgotPasswordModal
