import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Tag as AntTag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { getTagList, createTag, updateTag, deleteTag } from '@/api/tag'
import { Tag } from '@/types'

const TagPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [form] = Form.useForm()
  const [filterName, setFilterName] = useState('')

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    setLoading(true)
    try {
      const data = await getTagList()
      setAllTags(data)
      if (filterName) {
        const filtered = data.filter((tag: Tag) =>
          tag.name.toLowerCase().includes(filterName.toLowerCase())
        )
        setTags(filtered)
      } else {
        setTags(data)
      }
    } catch (error) {
      console.error('加载标签失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTag(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    form.setFieldsValue(tag)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTag(id)
      message.success('删除成功')
      loadTags()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingTag) {
        await updateTag(editingTag.id, values)
        message.success('更新成功')
      } else {
        await createTag(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadTags()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const columns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Tag) => (
        <AntTag color={record.color || 'blue'}>{name}</AntTag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || <span className="text-gray-400">暂无描述</span>,
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 100,
      render: (count: number) => (
        <span className="text-gray-600">{count || 0} 篇</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Tag) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除这个标签吗？"
            description={record.articleCount > 0 ? "该标签下有文章，无法删除" : "删除后不可恢复"}
            onConfirm={() => handleDelete(record.id)}
            okButtonProps={{ disabled: record.articleCount > 0 }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.articleCount > 0}
              title={record.articleCount > 0 ? "该标签下有文章，无法删除" : "删除"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="search-bar">
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="搜索标签名称"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filterName}
            onChange={(e) => {
              setFilterName(e.target.value)
              if (e.target.value) {
                const filtered = allTags.filter((tag: Tag) =>
                  tag.name.toLowerCase().includes(e.target.value.toLowerCase())
                )
                setTags(filtered)
              } else {
                setTags(allTags)
              }
            }}
            style={{ width: 220 }}
            allowClear
          />
          <div className="flex-1" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建标签
          </Button>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </div>

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          <Form.Item name="color" label="标签颜色">
            <Input placeholder="请输入颜色值，如 #1890ff" />
          </Form.Item>
          <Form.Item name="description" label="标签描述">
            <Input.TextArea rows={3} placeholder="请输入标签描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TagPage
