import { useEffect, useRef } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import '@/styles/markdown-preview.css'

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
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [value])

  return <div ref={containerRef} className={`vditor-reset ${className || ''}`} />
}

export default MarkdownPreview
