import { useState, useEffect, useRef } from 'react'
import { Button } from 'antd'

interface TalkContentProps {
  content: string
}

/**
 * 说说内容组件
 * - 默认最大高度300px，超过时显示渐变蒙版和"展开"按钮
 * - 支持展开/收起切换
 */
const TalkContent: React.FC<TalkContentProps> = ({ content }) => {
  const [expanded, setExpanded] = useState(false)
  const [isOverflow, setIsOverflow] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 检测内容是否超过300px
    if (contentRef.current) {
      const maxHeight = 300
      setIsOverflow(contentRef.current.scrollHeight > maxHeight)
    }
  }, [content])

  const handleToggle = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="rich-text-content text-sm text-gray-700 leading-relaxed transition-all duration-300"
        style={{
          maxHeight: expanded ? 'none' : '300px',
          overflow: expanded ? 'visible' : 'hidden',
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {isOverflow && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-2">
          <Button type="text" size="small" onClick={handleToggle} className="text-blue-600">
            展开全文
          </Button>
        </div>
      )}

      {expanded && (
        <div className="mt-2">
          <Button type="text" size="small" onClick={handleToggle} className="text-gray-500">
            收起
          </Button>
        </div>
      )}
    </div>
  )
}

export default TalkContent
