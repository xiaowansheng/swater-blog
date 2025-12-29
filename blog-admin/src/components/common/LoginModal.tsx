import React, { useState } from 'react'
import { Modal, Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'

const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      setLoginModalOpen(false)
      form.resetFields()
      // 登录成功后可以刷新当前页面或者重新尝试之前的请求
      // window.location.reload() 
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="登录已过期"
      open={isLoginModalOpen}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
    >
      <div className="py-4">
        <p className="text-gray-500 mb-6 text-center">您的登录已过期，请重新登录以继续操作。</p>
        <Form
          form={form}
          name="modal_login"
          onFinish={onFinish}
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
              重新登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default LoginModal
