import { Form, Input, Button, message, Checkbox } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useState } from 'react'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="login-title">博客管理后台</h1>
          <p className="login-subtitle">欢迎回来，请登录您的账户</p>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名"
              className="rounded-lg h-12"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
              className="rounded-lg h-12"
            />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a className="text-blue-500 hover:text-blue-600" href="#">
                忘记密码？
              </a>
            </div>
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              className="h-12 rounded-lg text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:opacity-90"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center text-gray-400 text-sm">
          © 2024 Blog Admin. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default Login
