import { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, Tag, Image, Tooltip, Switch } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'
import { getTalkList, createTalk, updateTalk, deleteTalk } from '@/api/talk'
import { Talk } from '@/types'
import { formatDate } from '@/utils/format'

const TalkPage: React.FC = () => {
  const [talks, setTalks] = useState<Talk[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTalk, setEditingTalk] = useState<Talk | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadTalks()
  }, [pagination.current, pagination.pageSize])

  const loadTalks = async () => {
    setLoading(true)
    try {
      const result = await getTalkList({
        page: pagination.current,
        size: pagination.pageSize,
      })
      setTalks(result.records)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('加载说说失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTalk(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (talk: Talk) => {
    setEditingTalk(talk)
    form.setFieldsValue({
      ...talk,
      images: talk.images?.join('\n'),
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTalk(id)
      message.success('删除成功')
      loadTalks()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        images: values.images ? values.images.split('\n').filter((s: string) => s.trim()) : [],
      }
      if (editingTalk) {
        await updateTalk(editingTalk.id, data)
        message.success('更新成功')
      } else {
        await createTalk(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadTalks()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  const columns = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string, record: Talk) => (
        <div>
          {record.isTop === 1 && (
            <Tag color="red" className="mr-2">
              <VerticalAlignTopOutlined /> 置顶
            </Tag>
          )}
          <span>{content}</span>
        </div>
      ),
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 150,
      render: (images: string[]) => (
        <div className="flex items-center gap-1">
          {images && images.length > 0 ? (
            <Image.PreviewGroup>
              {images.slice(0, 3).map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  width={40}
                  height={40}
                  className="object-cover rounded"
                />
              ))}
              {images.length > 3 && (
                <span className="text-gray-400 text-xs">+{images.length - 3}</span>
              )}
            </Image.PreviewGroup>
          ) : (
            <span className="text-gray-400 flex items-center gap-1">
              <PictureOutlined /> 无图片
            </span>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'default'}>
          {status === 1 ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '互动',
      key: 'interaction',
      width: 120,
      render: (_: any, record: Talk) => (
        <div className="text-xs text-gray-500">
          <span>❤️ {record.likeCount || 0}</span>
          <span className="ml-2">💬 {record.commentCount || 0}</span>
        </div>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: formatDate,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Talk) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这条说说吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="search-bar flex justify-between items-center">
        <h2 className="text-lg font-medium">说说管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          发布说说
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={talks}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条说说`,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
      </div>

      <Modal
        title={editingTalk ? '编辑说说' : '发布说说'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="content"
            label="说说内容"
            rules={[{ required: true, message: '请输入说说内容' }]}
          >
            <Input.TextArea rows={4} placeholder="分享你的想法..." showCount maxLength={500} />
          </Form.Item>
          <Form.Item name="images" label="图片" extra="每行一个图片URL">
            <Input.TextArea rows={3} placeholder="请输入图片URL，每行一个" />
          </Form.Item>
          <Form.Item name="isTop" label="置顶" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TalkPage
