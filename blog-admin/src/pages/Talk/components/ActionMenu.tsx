import { Button, Dropdown, Modal, message } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons'
import { Talk, TalkStatus } from '@/types'
import { updateTalk } from '@/api/talk'

interface ActionMenuProps {
  talk: Talk
  onEdit: (talk: Talk) => void
  onDelete: (id: number) => void
  onRefresh: () => void
}

/**
 * 说说操作菜单组件
 * - 编辑
 * - 置顶/取消置顶
 * - 发布/设为草稿
 * - 删除
 */
const ActionMenu: React.FC<ActionMenuProps> = ({ talk, onEdit, onDelete, onRefresh }) => {
  const handleTopChange = async () => {
    try {
      await updateTalk(talk.id, {
        content: talk.content,
        images: talk.images,
        isTop: talk.isTop === 1 ? 0 : 1,
        status: talk.status,
      })
      message.success(talk.isTop === 1 ? '已取消置顶' : '已置顶')
      onRefresh()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleStatusChange = async () => {
    try {
      const newStatus = talk.status === TalkStatus.PUBLISHED ? TalkStatus.DRAFT : TalkStatus.PUBLISHED
      await updateTalk(talk.id, {
        content: talk.content,
        images: talk.images,
        isTop: talk.isTop,
        status: newStatus,
      })
      message.success(newStatus === TalkStatus.PUBLISHED ? '已发布' : '已设为草稿')
      onRefresh()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条说说吗？删除后无法恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => onDelete(talk.id),
    })
  }

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: () => onEdit(talk),
    },
    {
      key: 'top',
      icon: talk.isTop === 1 ? <VerticalAlignBottomOutlined /> : <VerticalAlignTopOutlined />,
      label: talk.isTop === 1 ? '取消置顶' : '置顶',
      onClick: handleTopChange,
    },
    {
      key: 'status',
      icon: talk.status === TalkStatus.PUBLISHED ? <EyeInvisibleOutlined /> : <EyeOutlined />,
      label: talk.status === TalkStatus.PUBLISHED ? '设为草稿' : '发布',
      onClick: handleStatusChange,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: handleDelete,
    },
  ]

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <Button type="default" style={{ borderColor: '#d9d9d9' }}>
          操作
        </Button>
      </Dropdown>
    </div>
  )
}

export default ActionMenu
