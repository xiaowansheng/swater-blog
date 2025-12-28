import React, { useEffect, useRef, useState } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  height?: number
  placeholder?: string
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value = '',
  onChange,
  height = 600,
  placeholder = '开始写作吧...'
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const vditorInstance = useRef<Vditor | null>(null)
  const [isInit, setIsInit] = useState(false)

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
      input: (val) => {
        onChange?.(val)
      },
      after: () => {
        vditorInstance.current = vditor
        setIsInit(true)
      },
    })

    return () => {
      if (vditorInstance.current) {
        vditorInstance.current.destroy()
        vditorInstance.current = null
      }
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
