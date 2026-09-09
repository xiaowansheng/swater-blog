// 第一步：选择文件（上传 MD 文件或文件夹）

import {
  Alert,
  Button,
  Card,
  Divider,
  Space,
  Spin,
  Typography,
  Upload,
  message,
} from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import {
  FileMarkdownOutlined,
  FolderOutlined,
  InboxOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Dragger } = Upload
const { Text } = Typography

// 原 scss 中 :global .ant-upload-list 的等价 Tailwind 写法
// （限高滚动 + 边框底色 + 自定义滚动条，项目关闭了 preflight，border 需显式 border-solid）
const UPLOAD_LIST_CLASS = [
  '[&_.ant-upload-list]:mt-4',
  '[&_.ant-upload-list]:max-h-[300px]',
  '[&_.ant-upload-list]:overflow-y-auto',
  '[&_.ant-upload-list]:border',
  '[&_.ant-upload-list]:border-solid',
  '[&_.ant-upload-list]:border-[#f0f0f0]',
  '[&_.ant-upload-list]:rounded-md',
  '[&_.ant-upload-list]:p-2',
  '[&_.ant-upload-list]:bg-[#fafafa]',
  '[&_.ant-upload-list::-webkit-scrollbar]:w-[6px]',
  '[&_.ant-upload-list::-webkit-scrollbar-thumb]:bg-[#d9d9d9]',
  '[&_.ant-upload-list::-webkit-scrollbar-thumb]:rounded-[3px]',
  '[&_.ant-upload-list::-webkit-scrollbar-thumb:hover]:bg-[#bfbfbf]',
].join(' ')

interface FileSelectionStepProps {
  fileList: UploadFile[]
  fileLoading: boolean
  loading: boolean
  onFileListChange: (fileList: UploadFile[]) => void
  onFileLoadingChange: (loading: boolean) => void
  onNext: () => void
}

const FileSelectionStep: React.FC<FileSelectionStepProps> = ({
  fileList,
  fileLoading,
  loading,
  onFileListChange,
  onFileLoadingChange,
  onNext,
}) => {
  const navigate = useNavigate()

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'files',
    multiple: true,
    fileList,
    // 支持常见的 Markdown 和图片格式
    accept: '.md,.markdown,.png,.jpg,.jpeg,.gif,.svg,.webp,.bmp,.ico',
    // 启用目录上传
    directory: true,
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      onFileListChange(newFileList)
    },
    beforeUpload: (file) => {
      // 限制文件大小（50MB）
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB')
        return Upload.LIST_IGNORE
      }

      // 过滤掉隐藏文件和不需要的文件
      const fileName = file.name
      if (fileName.startsWith('.') || fileName === 'Thumbs.db' || fileName === '.DS_Store') {
        return Upload.LIST_IGNORE
      }

      return false // 阻止自动上传
    },
    onChange: (info) => {
      // 当文件数量变化时显示加载状态
      const newCount = info.fileList.length
      const oldCount = fileList.length

      if (newCount !== oldCount && newCount > 0) {
        // 开始加载
        if (!fileLoading) {
          onFileLoadingChange(true)
          message.loading({ content: '正在读取文件...', key: 'fileLoading', duration: 0 })
        }

        // 使用 setTimeout 让 UI 有机会更新
        setTimeout(() => {
          onFileListChange(info.fileList)
          onFileLoadingChange(false)
          message.success({ content: `已加载 ${info.fileList.length} 个文件`, key: 'fileLoading', duration: 2 })
        }, 0)
      } else {
        onFileListChange(info.fileList)
        if (fileLoading) {
          onFileLoadingChange(false)
          message.destroy('fileLoading')
        }
      }
    },
    customRequest: () => {
      // 阻止自动上传
    },
    // 自定义文件项渲染，显示相对路径
    itemRender: (originNode, file) => {
      const relativePath = (file.originFileObj as File | undefined)?.webkitRelativePath || file.name
      return (
        <div title={relativePath}>
          {originNode}
        </div>
      )
    },
  }

  // 统计目录信息
  const directories = new Set<string>()
  fileList.forEach((file) => {
    const relativePath = (file.originFileObj as File | undefined)?.webkitRelativePath || ''
    if (relativePath) {
      const parts = relativePath.split('/')
      if (parts.length > 1) {
        // 收集第一级目录（根目录后的第一个目录）
        directories.add(parts[0])
      }
    }
  })

  return (
    <div className={UPLOAD_LIST_CLASS}>
      <Card title="上传文件夹" bordered={false}>
        <Alert
          message="上传说明"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>点击选择一个包含 Markdown 文件的<strong>文件夹</strong></li>
              <li>文件夹中的目录结构会被保留，用于自动创建分类</li>
              <li>支持的文件格式：.md, .markdown 以及常见图片格式</li>
              <li>资源文件（图片）会自动关联到相应的文章</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Spin spinning={fileLoading} tip="正在读取文件...">
          <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击选择文件夹，或将文件夹拖拽到此区域</p>
            <p className="ant-upload-hint">
              将自动读取文件夹中的所有 Markdown 文件和资源文件
            </p>
          </Dragger>
        </Spin>

        <div className="mt-4">
          <Space size="large" wrap>
            <Text>
              <FileMarkdownOutlined /> MD 文件: {fileList.filter((f) => f.name.endsWith('.md') || f.name.endsWith('.markdown')).length} 个
            </Text>
            <Text>
              <PictureOutlined /> 资源文件: {fileList.filter((f) => !f.name.endsWith('.md') && !f.name.endsWith('.markdown')).length} 个
            </Text>
            {directories.size > 0 && (
              <Text>
                <FolderOutlined /> 目录: {directories.size} 个
              </Text>
            )}
            {fileList.length > 0 && (
              <Button
                size="small"
                danger
                onClick={() => onFileListChange([])}
              >
                清空文件
              </Button>
            )}
          </Space>
        </div>

        <Divider />

        <Space>
          <Button
            type="primary"
            onClick={onNext}
            disabled={fileList.length === 0}
            loading={loading}
          >
            下一步：配置导入 {fileList.length > 0 && `(${fileList.length} 个文件)`}
          </Button>
          <Button onClick={() => navigate('/article')}>
            取消
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default FileSelectionStep
