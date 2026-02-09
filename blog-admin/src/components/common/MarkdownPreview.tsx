import { useEffect, useRef } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import '@/styles/markdown-preview.css'
// import { getFullUrl } from '@/utils/format'
import config from '@/config'

interface MarkdownPreviewProps {
  value: string
  className?: string
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ value, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (!value) {
      container.innerHTML = ''
      return
    }

    const timer = setTimeout(() => {
      Vditor.preview(container, value, {
        theme: { current: 'light' },
        mode: 'light',
        markdown: {
          linkBase: config.resourcePrefix,
        },
        // transform: (html) => {
        //   // 匹配所有非 http(s) 开头的 img src 属性，使用 getFullUrl 处理路径
        //   return html.replace(/<img ([^>]*)src="(?!(http|https|data):\/?\/?([^"]*))([^"]+)"([^>]*)>/g, (_match, before, _p1, _p2, path, after) => {
        //     const fullUrl = getFullUrl(path)
        //     return `<img ${before}src="${fullUrl}"${after}>`
        //   })
        // }
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [value])

  return <div ref={containerRef} className={`vditor-reset ${className || ''}`} />
}

export default MarkdownPreview

