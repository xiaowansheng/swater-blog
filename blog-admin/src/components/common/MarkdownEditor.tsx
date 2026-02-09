import React, { useEffect, useRef, useState } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { uploadFile, uploadExternalImage, uploadExternalWebpage, isExternalImageUrl, isExternalWebUrl, extractUrls } from '@/api/file'
import { getFullUrl } from '@/utils/format'
import { message } from 'antd'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  height?: number
  placeholder?: string
  onSave?: () => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value = '',
  onChange,
  onSave,
  height = 600,
  placeholder = '开始写作吧...',
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
        transform: (html) => {
          // 匹配所有非 http(s) 开头的 img src 属性，使用 getFullUrl 处理路径
          return html.replace(/<img ([^>]*)src="(?!(http|https|data):\/?\/?([^"]*))([^"]+)"([^>]*)>/g, (_match, before, _p1, _p2, path, after) => {
            const fullUrl = getFullUrl(path)
            return `<img ${before}src="${fullUrl}"${after}>`
          })
        }
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
            const res = await uploadFile(files[0])
            // 直接使用返回的路径，预览时 transform 会处理前缀
            const url = res.url || res.storagePath
            const name = res.originalName || files[0].name
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

  // 处理外部图片URL转换为内链
  useEffect(() => {
    if (!isInit || !vditorInstance.current) return

    // ??????markdown??????????????????URL
    const extractImageUrls = (text: string): string[] => {
      const urlRegex = /!\[.*?\]\((.*?)\)/g
      const urls: string[] = []
      let match
      while ((match = urlRegex.exec(text)) !== null) {
        urls.push(match[1])
      }
      return urls
    }

    const extractExternalImagesFromHtml = (html: string): { src: string; alt: string }[] => {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      const images = tempDiv.querySelectorAll('img')
      const externalImages: { src: string; alt: string }[] = []
      images.forEach((img) => {
        const src = img.getAttribute('src')
        if (src && isExternalImageUrl(src)) {
          externalImages.push({ src, alt: img.getAttribute('alt') || '' })
        }
      })
      return externalImages
    }

    const replaceExternalUrls = async (text: string): Promise<string | null> => {
      const imageUrls = extractImageUrls(text)
      const externalImageUrls = imageUrls.filter((url) => isExternalImageUrl(url))

      const allUrls = extractUrls(text)
      const externalWebUrls = allUrls.filter((url) => isExternalWebUrl(url))

      if (externalImageUrls.length === 0 && externalWebUrls.length === 0) return null

      let newText = text
      const results: { oldUrl: string; newUrl: string; type: string; success: boolean }[] = []

      if (externalImageUrls.length > 0) {
        const loadingKey = 'uploading-external'
        message.loading({ content: '????????????????????????...', key: loadingKey, duration: 0 })

        const imagePromises = externalImageUrls.map(async (oldUrl) => {
          try {
            const res = await uploadExternalImage(oldUrl)
            const newUrl = getFullUrl(res.url || res.storagePath)
            return { oldUrl, newUrl, type: '??????', success: true }
          } catch (error) {
            console.error(`????????????????????????: ${oldUrl}`, error)
            return { oldUrl, newUrl: oldUrl, type: '??????', success: false }
          }
        })

        const imageResults = await Promise.all(imagePromises)
        results.push(...imageResults)

        message.success({ content: `???????????? ${imageResults.filter((r) => r.success).length} ?????????`, key: loadingKey })
      }

      if (externalWebUrls.length > 0) {
        const webLoadingKey = 'uploading-webpage'
        message.loading({ content: '????????????????????????...', key: webLoadingKey, duration: 0 })

        const webPromises = externalWebUrls.map(async (oldUrl) => {
          try {
            const res = await uploadExternalWebpage(oldUrl)
            const newUrl = getFullUrl(res.url || res.storagePath)
            return { oldUrl, newUrl, type: '??????', success: true }
          } catch (error) {
            console.error(`????????????????????????: ${oldUrl}`, error)
            return { oldUrl, newUrl: oldUrl, type: '??????', success: false }
          }
        })

        const webResults = await Promise.all(webPromises)
        results.push(...webResults)

        const successWebCount = webResults.filter((r) => r.success).length
        if (successWebCount > 0) {
          message.success({ content: `???????????? ${successWebCount} ?????????`, key: webLoadingKey })
        } else {
          message.warning({ content: '??????????????????????????????CORS??????????????????????????????', key: webLoadingKey })
        }
      }

      results.forEach(({ oldUrl, newUrl, success }) => {
        if (success) {
          newText = newText.replaceAll(oldUrl, newUrl)
        }
      })

      return newText
    }

    const replaceExternalImagesInHtml = async (html: string, images: { src: string; alt: string }[]) => {
      const loadingKey = 'uploading-external'
      message.loading({ content: '????????????????????????...', key: loadingKey, duration: 0 })

      const uploadPromises = images.map(async ({ src, alt }) => {
        try {
          const res = await uploadExternalImage(src)
          const newUrl = getFullUrl(res.url || res.storagePath)
          return { oldSrc: src, newSrc: newUrl, alt, success: true }
        } catch (error) {
          console.error(`????????????????????????: ${src}`, error)
          return { oldSrc: src, newSrc: src, alt, success: false }
        }
      })

      const results = await Promise.all(uploadPromises)
      let newHtml = html
      results.forEach(({ oldSrc, newSrc, success }) => {
        if (success) {
          newHtml = newHtml.replaceAll(`src="${oldSrc}"`, `src="${newSrc}"`)
        }
      })

      const successCount = results.filter((r) => r.success).length
      const failCount = results.filter((r) => !r.success).length

      if (failCount === 0) {
        message.success({ content: `???????????? ${successCount} ?????????`, key: loadingKey })
      } else {
        message.warning({ content: `???????????? ${successCount} ???????????? ${failCount} ???`, key: loadingKey })
      }

      return newHtml
    }

    const handlePaste = async (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData
      if (!clipboardData) return

      const html = clipboardData.getData('text/html')
      if (html) {
        const externalImages = extractExternalImagesFromHtml(html)
        if (externalImages.length > 0) {
          e.preventDefault()
          const newHtml = await replaceExternalImagesInHtml(html, externalImages)
          const newMarkdown = vditorInstance.current?.html2md(newHtml) || newHtml
          vditorInstance.current?.insertValue(newMarkdown)
          return
        }
      }

      const text = clipboardData.getData('text/plain')
      if (!text) return

      const newText = await replaceExternalUrls(text)
      if (!newText) return

      e.preventDefault()
      vditorInstance.current?.insertValue(newText)
    }

    const handleDrop = async (e: DragEvent) => {
      const dataTransfer = e.dataTransfer
      if (!dataTransfer) return
      if (dataTransfer.files && dataTransfer.files.length > 0) return

      const html = dataTransfer.getData('text/html')
      if (html) {
        const externalImages = extractExternalImagesFromHtml(html)
        if (externalImages.length > 0) {
          e.preventDefault()
          const newHtml = await replaceExternalImagesInHtml(html, externalImages)
          const newMarkdown = vditorInstance.current?.html2md(newHtml) || newHtml
          vditorInstance.current?.insertValue(newMarkdown)
          return
        }
      }

      const text = dataTransfer.getData('text/uri-list') || dataTransfer.getData('text/plain')
      if (!text) return

      const newText = await replaceExternalUrls(text)
      if (!newText) return

      e.preventDefault()
      vditorInstance.current?.insertValue(newText)
    }

    const handleDragOver = (e: DragEvent) => {
      const dataTransfer = e.dataTransfer
      if (!dataTransfer) return
      if (dataTransfer.files && dataTransfer.files.length > 0) return

      const types = Array.from(dataTransfer.types || [])
      if (types.includes('text/uri-list') || types.includes('text/html') || types.includes('text/plain')) {
        e.preventDefault()
      }
    }

    const editorRoot = vditorInstance.current?.vditor?.element
    const isInEditor = (target: EventTarget | null) => {
      if (!editorRoot || !(target instanceof Node)) return false
      return editorRoot.contains(target)
    }

    const handlePasteInEditor = async (e: ClipboardEvent) => {
      if (!isInEditor(e.target)) return
      await handlePaste(e)
    }

    const handleDropInEditor = async (e: DragEvent) => {
      if (!isInEditor(e.target)) return
      await handleDrop(e)
    }

    const handleDragOverInEditor = (e: DragEvent) => {
      if (!isInEditor(e.target)) return
      handleDragOver(e)
    }

    document.addEventListener('paste', handlePasteInEditor, true)
    document.addEventListener('drop', handleDropInEditor, true)
    document.addEventListener('dragover', handleDragOverInEditor, true)

    return () => {
      document.removeEventListener('paste', handlePasteInEditor, true)
      document.removeEventListener('drop', handleDropInEditor, true)
      document.removeEventListener('dragover', handleDragOverInEditor, true)
    }
  }, [isInit])

  return (
    <div className="overflow-hidden w-full rounded-md border vditor-container">
      <div ref={editorRef} />
      <style dangerouslySetInnerHTML={{
        __html: `
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
