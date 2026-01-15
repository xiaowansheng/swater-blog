import React, { useState, useEffect } from 'react'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { uploadFile } from '@/api/file'
import { getFullUrl } from '@/utils/format'
import { message } from 'antd'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  height?: number
  className?: string
  category?: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  height = 300,
  className = '',
  category = 'talk_image'
}) => {
  // editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null)

  // 编辑器内容
  const [html, setHtml] = useState(value)

  // 监听外部 value 变化
  useEffect(() => {
    setHtml(value)
  }, [value])

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: [
      'fullScreen', // 排除全屏，因为在 Modal 中可能会有问题
    ]
  }

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder,
    MENU_CONF: {
      uploadImage: {
        // 自定义上传逻辑
        async customUpload(file: File, insertFn: any) {
          try {
            const res = await uploadFile(file, category)
            // 使用 getFullUrl 拼接完整路径，优先使用 url 字段，其次使用 storagePath
            const url = getFullUrl(res.url || res.storagePath)
            const alt = res.originalName || file.name
            insertFn(url, alt, url)
          } catch (error) {
            console.error('上传图片失败:', error)
            message.error('上传图片失败')
          }
        }
      }
    }
  }

  // 及时销毁编辑器，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  const handleHtmlChange = (editor: IDomEditor) => {
    const newHtml = editor.getHtml()
    setHtml(newHtml)
    if (onChange) {
      // 如果内容只是 <p><br></p> (空内容)，则传回空字符串
      onChange(newHtml === '<p><br></p>' ? '' : newHtml)
    }
  }

  return (
    <div className={`border border-gray-200 rounded-md overflow-hidden z-[100] ${className}`}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        className="border-b border-gray-200"
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={handleHtmlChange}
        mode="default"
        style={{ height: `${height}px`, overflowY: 'hidden' }}
      />
    </div>
  )
}

export default RichTextEditor
