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
 * - 上架/下架（仅非草稿状态显示）
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
      let newStatus: string
      let successMsg: string

      if (talk.status === TalkStatus.PUBLISHED) {
        // 已发布 -> 下架（改为私密）
        newStatus = TalkStatus.PRIVATE
        successMsg = '已下架'
      } else if (talk.status === TalkStatus.PRIVATE) {
        // 私密 -> 上架（改为已发布）
        newStatus = TalkStatus.PUBLISHED
        successMsg = '已上架'
      } else {
        // 草稿不处理
        return
      }

      await updateTalk(talk.id, {
        content: talk.content,
        images: talk.images,
        isTop: talk.isTop,
        status: newStatus,
      })
      message.success(successMsg)
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
    // 只有非草稿状态才显示上架/下架选项
    ...(talk.status !== TalkStatus.DRAFT ? [
      {
        key: 'status',
        icon: talk.status === TalkStatus.PUBLISHED ? <EyeInvisibleOutlined /> : <EyeOutlined />,
        label: talk.status === TalkStatus.PUBLISHED ? '下架' : '上架',
        onClick: handleStatusChange,
      },
    ] : []),
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
