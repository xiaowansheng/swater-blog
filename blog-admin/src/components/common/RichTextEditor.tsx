import React, { useState, useEffect } from 'react'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  height?: number
  className?: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  height = 300,
  className = ''
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
        // 自定义上传逻辑，后续可以对接项目的上传接口
        async customUpload(file: File, insertFn: any) {
          // 这里可以调用项目已有的上传 api
          // 暂时先使用 base64 或者提示用户
          const reader = new FileReader()
          reader.onload = (e) => {
            const base64 = e.target?.result as string
            insertFn(base64, '', '')
          }
          reader.readAsDataURL(file)
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
