import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message } from 'antd'
import { getMenuList, deleteMenu } from '@/api/menu'
import { MenuItem } from '@/types'

const MenuPage: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = async () => {
    setLoading(true)
    try {
      const data = await getMenuList()
      setMenus(data)
    } catch (error) {
      console.error('加载菜单失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMenu(id)
      message.success('删除成功')
      loadMenus()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '路径', dataIndex: 'path', key: 'path' },
    { title: '图标', dataIndex: 'icon', key: 'icon' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MenuItem) => (
        <Space>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Table columns={columns} dataSource={menus} rowKey="id" loading={loading} />
    </div>
  )
}

export default MenuPage

