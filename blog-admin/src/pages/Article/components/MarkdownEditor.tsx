import MDEditor from '@uiw/react-md-editor'
import { useState } from 'react'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  const [content, setContent] = useState(value || '')

  const handleChange = (val?: string) => {
    const newValue = val || ''
    setContent(newValue)
    onChange?.(newValue)
  }

  return (
    <div data-color-mode="light">
      <MDEditor value={content} onChange={handleChange} height={500} />
    </div>
  )
}

export default MarkdownEditor

