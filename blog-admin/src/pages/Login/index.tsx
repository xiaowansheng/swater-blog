import { Form, Input, Button, message, Checkbox } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'
import { useLockscreenStore } from '@/store/lockscreen'
import { useState } from 'react'
import ForgotPasswordModal from '@/components/common/ForgotPasswordModal'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { restoreTabs, clearCachedTabs, cachedTabs } = useTabsStore()
  const [loading, setLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('登录页面 - 忘记密码被点击')
    setForgotPasswordOpen(true)
  }

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true)
    try {
      await login(values.username, values.password, values.remember)
      message.success('登录成功')
      
      // 登录成功后，如果有锁屏状态，则重置
      useLockscreenStore.getState().resetLock()
      
      // 检查是否有缓存的标签页
      if (cachedTabs.length > 0) {
        console.log('发现缓存的标签页，准备恢复:', cachedTabs)
        // 恢复标签页
        restoreTabs()
        // 跳转到第一个缓存的标签页
        const firstTab = cachedTabs[0]
        navigate(firstTab.path, { replace: true })
        // 清除缓存
        clearCachedTabs()
      } else {
        // 没有缓存的标签页，跳转到默认页面
        navigate('/dashboard')
      }
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* 背景装饰圆圈 */}
      <div className="login-background-circle w-96 h-96 bg-purple-300 top-0 -left-20"></div>
      <div className="login-background-circle w-96 h-96 bg-blue-300 bottom-0 -right-20 animation-delay-2000"></div>
      <div className="login-background-circle w-80 h-80 bg-pink-300 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animation-delay-4000"></div>

      <div className="login-card">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <span className="text-white text-4xl font-bold">B</span>
          </div>
          <h1 className="login-title">博客管理后台</h1>
          <p className="login-subtitle">欢迎回来，请登录您的账户</p>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{ remember: false }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名"
              className="rounded-lg h-12 bg-gray-50/50 border-gray-200 hover:bg-white focus:bg-white transition-all duration-300"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
              className="rounded-lg h-12 bg-gray-50/50 border-gray-200 hover:bg-white focus:bg-white transition-all duration-300"
            />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-500">记住我</Checkbox>
              </Form.Item>
              <a 
                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors" 
                onClick={handleForgotPassword}
              >
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
              className="h-12 rounded-lg text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:shadow-lg hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center text-gray-400 text-sm mt-6">
          © 2024 Blog Admin. All rights reserved.
        </div>
      </div>

      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </div>
  )
}

export default Login
