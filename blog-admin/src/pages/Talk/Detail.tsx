import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Tag, Space, Spin, Empty, Avatar } from 'antd'
import { ArrowLeftOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'
import { getTalkById } from '@/api/talk'
import { getAuthorConfig } from '@/api/config'
import { Talk, TalkStatus, TALK_STATUS_MAP } from '@/types'
import { getFullUrl } from '@/utils/format'
import Image from '@/components/common/ImageWithPreview'

interface AuthorInfo {
  name: string
  avatar: string
}

const TalkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [talk, setTalk] = useState<Talk | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo>({ name: '', avatar: '' })

  useEffect(() => {
    loadTalkDetail()
    loadAuthorConfig()
  }, [id])

  const loadAuthorConfig = async () => {
    try {
      const authorConfig = await getAuthorConfig()
      setAuthorInfo({
        name: authorConfig.name,
        avatar: authorConfig.avatar,
      })
    } catch (error) {
      console.error('加载作者配置失败', error)
    }
  }

  const loadTalkDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getTalkById(Number(id))
      setTalk(data)
    } catch (error) {
      console.error('加载说说详情失败', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const s = TALK_STATUS_MAP[status as keyof typeof TALK_STATUS_MAP] || TALK_STATUS_MAP[TalkStatus.DRAFT]
    return s.color
  }

  const getStatusLabel = (status: string) => {
    const s = TALK_STATUS_MAP[status as keyof typeof TALK_STATUS_MAP] || TALK_STATUS_MAP[TalkStatus.DRAFT]
    return s.label
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  if (!talk) {
    return <Empty description="说说不存在" className="py-12" />
  }

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/talk')} className="mb-4">
          返回列表
        </Button>

        {/* 详情卡片 */}
        <Card>
          {/* 头部信息 */}
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar src={getFullUrl(authorInfo.avatar)} size={48}>
                {authorInfo.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-gray-800 text-lg">{authorInfo.name}</span>
                <div className="text-sm text-gray-400">{talk.createTime}</div>
              </div>
            </div>
            <Space size={4}>
              {talk.isTop === 1 && (
                <Tag color="red" icon={<VerticalAlignTopOutlined />}>
                  置顶
                </Tag>
              )}
              <Tag color={getStatusColor(talk.status)}>{getStatusLabel(talk.status)}</Tag>
            </Space>
          </div>

          {/* 内容区域 */}
          <div
            className="rich-text-content text-gray-700 mb-6"
            dangerouslySetInnerHTML={{ __html: talk.content }}
          />

          {/* 图片展示 */}
          {talk.images && talk.images.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                图片 ({talk.images.length})
              </h4>
              <Image.PreviewGroup>
                <div className="grid grid-cols-3 gap-3">
                  {talk.images.map((img, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={img}
                        alt={`图片${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          )}

          {/* 元信息 */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
            <span>❤️ 点赞 {talk.likeCount || 0}</span>
            <span>💬 评论 {talk.commentCount || 0}</span>
            {talk.updateTime && <span>更新于 {talk.updateTime}</span>}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TalkDetail
