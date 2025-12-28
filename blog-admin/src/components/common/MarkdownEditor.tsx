import MDEditor from '@uiw/react-md-editor'
import { useState, useEffect } from 'react'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  height?: number
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value = '', onChange, height = 600 }) => {
  const [content, setContent] = useState(value)

  useEffect(() => {
    setContent(value)
  }, [value])

  const handleChange = (val?: string) => {
    const newValue = val || ''
    setContent(newValue)
    onChange?.(newValue)
  }

  return (
    <div data-color-mode="light" className="w-full">
      <MDEditor value={content} onChange={handleChange} height={height} />
    </div>
  )
}

export default MarkdownEditor
