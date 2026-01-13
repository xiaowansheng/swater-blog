import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Space } from 'antd'
import { useLocation } from 'react-router-dom'

const TestCache: React.FC = () => {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [mountTime] = useState(() => new Date().toISOString())
  const location = useLocation()

  useEffect(() => {
    console.log('🧪 TestCache 组件挂载:', {
      pathname: location.pathname,
      mountTime,
      timestamp: new Date().toISOString()
    })

    return () => {
      console.log('🧪 TestCache 组件卸载:', {
        pathname: location.pathname,
        mountTime,
        timestamp: new Date().toISOString()
      })
    }
  }, [location.pathname, mountTime])

  return (
    <div className="p-6">
      <Card title="页面缓存测试" className="max-w-md">
        <Space direction="vertical" className="w-full">
          <div>
            <strong>组件挂载时间:</strong> {mountTime}
          </div>
          
          <div>
            <strong>计数器:</strong> {count}
            <br />
            <Button onClick={() => setCount(c => c + 1)} className="mt-2">
              增加计数
            </Button>
          </div>

          <div>
            <strong>输入框状态:</strong>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入一些文字测试状态保持"
              className="mt-2"
            />
          </div>

          <div className="text-sm text-gray-500">
            如果页面缓存工作正常，切换到其他页面再回来时：
            <ul className="mt-2 ml-4">
              <li>• 挂载时间不会改变</li>
              <li>• 计数器值会保持</li>
              <li>• 输入框内容会保持</li>
              <li>• 控制台不会显示重新挂载日志</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default TestCache