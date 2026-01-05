import React, { useEffect, useRef, useState } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { uploadFile } from '@/api/file'
import { getFullUrl } from '@/utils/format'
import { message } from 'antd'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  height?: number
  placeholder?: string
  category?: string
  onSave?: () => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value = '',
  onChange,
  onSave,
  height = 600,
  placeholder = '开始写作吧...',
  category = 'article_image'
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const vditorInstance = useRef<Vditor | null>(null)
  const [isInit, setIsInit] = useState(false)
  const onSaveRef = useRef(onSave)

  // 更新 onSave 引用
  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    if (!editorRef.current) return

    const vditor = new Vditor(editorRef.current, {
      height,
      placeholder,
      value,
      mode: 'ir', // 即时渲染模式，类似 Typora
      theme: 'classic',
      icon: 'ant',
      cache: {
        enable: false, // 禁用缓存，由外部状态控制
      },
      preview: {
        actions: [],
      },
      toolbarConfig: {
        pin: true,
      },
      counter: {
        enable: true,
        type: 'markdown',
      },
      upload: {
        accept: 'image/*',
        multiple: false,
        handler: async (files: File[]) => {
          if (files.length === 0) return null
          try {
            const res = await uploadFile(files[0], category)
            const url = getFullUrl(res.fileUrl)
            const name = res.fileName || files[0].name
            // 插入图片到编辑器
            vditor.insertValue(`![${name}](${url})`)
          } catch (error) {
            console.error('上传图片失败:', error)
            message.error('上传图片失败')
          }
          return null
        }
      },
      input: (val) => {
        onChange?.(val)
      },
      after: () => {
        vditorInstance.current = vditor
        setIsInit(true)
      },
    })

    // 添加 Ctrl+S 快捷键监听
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检测 Ctrl+S 或 Cmd+S（Mac）
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault() // 阻止浏览器默认保存行为
        onSaveRef.current?.() // 调用保存回调
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      if (vditorInstance.current) {
        vditorInstance.current.destroy()
        vditorInstance.current = null
      }
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // 监听外部 value 变化（仅在初始化后且内容不一致时更新）
  useEffect(() => {
    if (isInit && vditorInstance.current && value !== vditorInstance.current.getValue()) {
      vditorInstance.current.setValue(value)
    }
  }, [value, isInit])

  return (
    <div className="overflow-hidden w-full rounded-md border vditor-container">
      <div ref={editorRef} />
      <style dangerouslySetInnerHTML={{ __html: `
        .vditor {
          border: none !important;
        }
        .vditor-toolbar {
          padding-left: 12px !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        .vditor-reset {
          font-family: inherit !important;
        }
      `}} />
    </div>
  )
}

export default MarkdownEditor
