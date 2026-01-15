import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Empty,
  Spin,
  Upload,
  Row,
  Col,
  Tag,
  Select,
} from 'antd'
import Image from '@/components/common/ImageWithPreview'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { getAlbumList, createAlbum, updateAlbum, deleteAlbum, AlbumDTO } from '@/api/album'
import { Album, AlbumStatus, ALBUM_STATUS_MAP } from '@/types'

const AlbumPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([])
  const [allAlbums, setAllAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState<{
    name: string
    status: string | undefined
  }>({
    name: '',
    status: undefined,
  })


  const loadAlbums = async () => {
    setLoading(true)
    try {
      const result = await getAlbumList()
      const allAlbumData = result.records || []
      setAllAlbums(allAlbumData)

      let filtered = allAlbumData
      if (filters.name) {
        filtered = filtered.filter((album: Album) =>
          album.name.toLowerCase().includes(filters.name.toLowerCase())
        )
      }
      if (filters.status) {
        filtered = filtered.filter((album: Album) => album.status === filters.status)
      }
      setAlbums(filtered)
    } catch (error) {
      console.error('加载相册失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [filters])

  const handleCreate = () => {
    setEditingAlbum(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (album: Album) => {
    setEditingAlbum(album)
    form.setFieldsValue(album)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAlbum(id)
      message.success('删除成功')
      loadAlbums()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, values)
        message.success('更新成功')
      } else {
        await createAlbum(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadAlbums()
    } catch (error) {
      console.error('提交失败', error)
    }
  }

  return (
    <div className="page-container">
      <div className="search-bar">
        <div className="flex gap-4 items-center flex-wrap">
          <Input
            placeholder="相册名称"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="状态"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value={AlbumStatus.PUBLISHED}>已发布</Select.Option>
            <Select.Option value={AlbumStatus.DRAFT}>草稿</Select.Option>
            <Select.Option value={AlbumStatus.PRIVATE}>私密</Select.Option>
          </Select>
          <div className="flex-1" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建相册
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : albums.length === 0 ? (
        <div className="table-container">
          <Empty description="暂无相册" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {albums.map((album) => (
            <Col xs={24} sm={12} md={8} lg={6} key={album.id}>
              <Card
                hoverable
                cover={
                  album.cover ? (
                    <div className="h-40 overflow-hidden">
                      <Image
                        alt={album.name}
                        src={album.cover}
                        className="w-full h-full object-cover"
                        previewEnabled={false}
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      <PictureOutlined className="text-4xl text-gray-300" />
                    </div>
                  )
                }
                actions={[
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(album)}
                  />,
                  <Popconfirm
                    title="确定删除这个相册吗？"
                    onConfirm={() => handleDelete(album.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={
                    <div className="flex items-center justify-between">
                      <span>{album.name}</span>
                      <Tag color={ALBUM_STATUS_MAP[album.status as AlbumStatus]?.color || 'default'}>
                        {ALBUM_STATUS_MAP[album.status as AlbumStatus]?.label || '未知'}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p className="text-gray-500 truncate">
                        {album.description || '暂无描述'}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {album.pictureCount || 0} 张图片
                      </p>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingAlbum ? '编辑相册' : '新建相册'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="相册名称"
            rules={[{ required: true, message: '请输入相册名称' }]}
          >
            <Input placeholder="请输入相册名称" />
          </Form.Item>
          <Form.Item name="description" label="相册描述">
            <Input.TextArea rows={3} placeholder="请输入相册描述" />
          </Form.Item>
          <Form.Item name="cover" label="封面图片">
            <Input placeholder="请输入封面图片URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AlbumPage
