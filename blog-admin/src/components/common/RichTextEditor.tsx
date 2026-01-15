import React, { useState, useEffect } from 'react'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { uploadFile, uploadExternalImage, uploadExternalWebpage, isExternalImageUrl, isExternalWebUrl, extractUrls } from '@/api/file'
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
    if (editor == null) return

    // 配置粘贴钩子，处理外部图片链接
    editor.on('paste', async (editor: IDomEditor, event: ClipboardEvent) => {
      const clipboardData = event.clipboardData
      if (!clipboardData) return

      // 检查是否粘贴了HTML内容（包含图片）
      const html = clipboardData.getData('text/html')
      if (html) {
        // 提取HTML中的所有img标签
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        const images = tempDiv.querySelectorAll('img')

        if (images.length > 0) {
          const externalImages: { src: string; alt: string }[] = []

          // 检查是否有外部图片
          images.forEach(img => {
            const src = img.getAttribute('src')
            if (src && isExternalImageUrl(src)) {
              externalImages.push({
                src,
                alt: img.getAttribute('alt') || ''
              })
            }
          })

          // 如果有外部图片，阻止默认粘贴并转存
          if (externalImages.length > 0) {
            event.preventDefault()

            try {
              const loadingKey = 'uploading-external'
              message.loading({ content: '正在转存外部图片...', key: loadingKey, duration: 0 })

              // 并发上传所有外部图片
              const uploadPromises = externalImages.map(async ({ src, alt }) => {
                try {
                  const res = await uploadExternalImage(src, category)
                  const newUrl = getFullUrl(res.url || res.storagePath)
                  return { oldSrc: src, newSrc: newUrl, alt, success: true }
                } catch (error) {
                  console.error(`上传外部图片失败: ${src}`, error)
                  return { oldSrc: src, newSrc: src, alt, success: false }
                }
              })

              const results = await Promise.all(uploadPromises)

              // 替换HTML中的图片URL
              let newHtml = html
              results.forEach(({ oldSrc, newSrc, success }) => {
                if (success) {
                  newHtml = newHtml.replaceAll(`src="${oldSrc}"`, `src="${newSrc}"`)
                }
              })

              // 插入处理后的HTML
              editor.dangerouslyInsertHtml(newHtml)

              // 显示结果
              const successCount = results.filter(r => r.success).length
              const failCount = results.filter(r => !r.success).length

              if (failCount === 0) {
                message.success({ content: `成功转存 ${successCount} 张图片`, key: loadingKey })
              } else {
                message.warning({
                  content: `成功转存 ${successCount} 张，失败 ${failCount} 张`,
                  key: loadingKey
                })
              }
            } catch (error) {
              console.error('处理外部图片失败:', error)
              message.error('转存外部图片失败')
            }

            return false // 阻止默认粘贴行为
          }
        }
      }

      // 检查纯文本中的外部链接（图片和网页）
      const text = clipboardData.getData('text/plain')
      if (text) {
        // 提取所有URL
        const allUrls = extractUrls(text)

        // 分类外部链接
        const externalImageUrls = allUrls.filter(url => isExternalImageUrl(url))
        const externalWebUrls = allUrls.filter(url => isExternalWebUrl(url))

        // 如果有外部链接，处理转存
        if (externalImageUrls.length > 0 || externalWebUrls.length > 0) {
          event.preventDefault()

          try {
            let newText = text
            const results: { oldUrl: string; newUrl: string; type: string; success: boolean }[] = []

            // 处理外部图片
            if (externalImageUrls.length > 0) {
              const loadingKey = 'uploading-external-image'
              message.loading({ content: '正在转存外部图片...', key: loadingKey, duration: 0 })

              const imagePromises = externalImageUrls.map(async (oldUrl) => {
                try {
                  const res = await uploadExternalImage(oldUrl, category)
                  const newUrl = getFullUrl(res.url || res.storagePath)
                  return { oldUrl, newUrl, type: '图片', success: true }
                } catch (error) {
                  console.error(`上传外部图片失败: ${oldUrl}`, error)
                  return { oldUrl, newUrl: oldUrl, type: '图片', success: false }
                }
              })

              const imageResults = await Promise.all(imagePromises)
              results.push(...imageResults)

              message.success({
                content: `成功转存 ${imageResults.filter(r => r.success).length} 张图片`,
                key: loadingKey
              })
            }

            // 处理外部网页链接
            if (externalWebUrls.length > 0) {
              const webLoadingKey = 'uploading-external-web'
              message.loading({ content: '正在转存外部网页...', key: webLoadingKey, duration: 0 })

              const webPromises = externalWebUrls.map(async (oldUrl) => {
                try {
                  const res = await uploadExternalWebpage(oldUrl, category)
                  const newUrl = getFullUrl(res.url || res.storagePath)
                  return { oldUrl, newUrl, type: '网页', success: true }
                } catch (error) {
                  console.error(`转存外部网页失败: ${oldUrl}`, error)
                  return { oldUrl, newUrl: oldUrl, type: '网页', success: false }
                }
              })

              const webResults = await Promise.all(webPromises)
              results.push(...webResults)

              const successWebCount = webResults.filter(r => r.success).length
              if (successWebCount > 0) {
                message.success({ content: `成功转存 ${successWebCount} 个网页`, key: webLoadingKey })
              } else {
                message.warning({
                  content: '网页转存失败（可能受CORS限制），已保留原链接',
                  key: webLoadingKey
                })
              }
            }

            // 替换文本中的URL
            results.forEach(({ oldUrl, newUrl, success }) => {
              if (success) {
                newText = newText.replaceAll(oldUrl, newUrl)
              }
            })

            // 插入处理后的文本
            editor.insertText(newText)
          } catch (error) {
            console.error('处理外部链接失败:', error)
            message.error('转存外部链接失败')
          }

          return false // 阻止默认粘贴行为
        }
      }
    })



    editor.on('drop', async (editor: IDomEditor, event: DragEvent) => {
      const dataTransfer = event.dataTransfer
      if (!dataTransfer) return
      if (dataTransfer.files && dataTransfer.files.length > 0) return

      const html = dataTransfer.getData('text/html')
      if (html) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        const images = tempDiv.querySelectorAll('img')

        if (images.length > 0) {
          const externalImages: { src: string; alt: string }[] = []

          images.forEach(img => {
            const src = img.getAttribute('src')
            if (src && isExternalImageUrl(src)) {
              externalImages.push({
                src,
                alt: img.getAttribute('alt') || ''
              })
            }
          })

          if (externalImages.length > 0) {
            event.preventDefault()

            try {
              const loadingKey = 'uploading-external'
              message.loading({ content: '????????????????????????...', key: loadingKey, duration: 0 })

              const uploadPromises = externalImages.map(async ({ src, alt }) => {
                try {
                  const res = await uploadExternalImage(src, category)
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

              editor.dangerouslyInsertHtml(newHtml)

              const successCount = results.filter(r => r.success).length
              const failCount = results.filter(r => !r.success).length

              if (failCount === 0) {
                message.success({ content: `???????????? ${successCount} ?????????`, key: loadingKey })
              } else {
                message.warning({
                  content: `???????????? ${successCount} ???????????? ${failCount} ???`,
                  key: loadingKey
                })
              }
            } catch (error) {
              console.error('????????????????????????:', error)
              message.error('????????????????????????')
            }

            return false
          }
        }
      }

      const text = dataTransfer.getData('text/uri-list') || dataTransfer.getData('text/plain')
      if (text) {
        const allUrls = extractUrls(text)
        const externalImageUrls = allUrls.filter(url => isExternalImageUrl(url))
        const externalWebUrls = allUrls.filter(url => isExternalWebUrl(url))

        if (externalImageUrls.length > 0 || externalWebUrls.length > 0) {
          event.preventDefault()

          try {
            let newText = text
            const results: { oldUrl: string; newUrl: string; type: string; success: boolean }[] = []

            if (externalImageUrls.length > 0) {
              const loadingKey = 'uploading-external-image'
              message.loading({ content: '????????????????????????...', key: loadingKey, duration: 0 })

              const imagePromises = externalImageUrls.map(async (oldUrl) => {
                try {
                  const res = await uploadExternalImage(oldUrl, category)
                  const newUrl = getFullUrl(res.url || res.storagePath)
                  return { oldUrl, newUrl, type: '??????', success: true }
                } catch (error) {
                  console.error(`????????????????????????: ${oldUrl}`, error)
                  return { oldUrl, newUrl: oldUrl, type: '??????', success: false }
                }
              })

              const imageResults = await Promise.all(imagePromises)
              results.push(...imageResults)

              message.success({
                content: `???????????? ${imageResults.filter(r => r.success).length} ?????????`,
                key: loadingKey
              })
            }

            if (externalWebUrls.length > 0) {
              const webLoadingKey = 'uploading-external-web'
              message.loading({ content: '????????????????????????...', key: webLoadingKey, duration: 0 })

              const webPromises = externalWebUrls.map(async (oldUrl) => {
                try {
                  const res = await uploadExternalWebpage(oldUrl, category)
                  const newUrl = getFullUrl(res.url || res.storagePath)
                  return { oldUrl, newUrl, type: '??????', success: true }
                } catch (error) {
                  console.error(`????????????????????????: ${oldUrl}`, error)
                  return { oldUrl, newUrl: oldUrl, type: '??????', success: false }
                }
              })

              const webResults = await Promise.all(webPromises)
              results.push(...webResults)

              const successWebCount = webResults.filter(r => r.success).length
              if (successWebCount > 0) {
                message.success({ content: `???????????? ${successWebCount} ?????????`, key: webLoadingKey })
              } else {
                message.warning({
                  content: '??????????????????????????????CORS??????????????????????????????',
                  key: webLoadingKey
                })
              }
            }

            results.forEach(({ oldUrl, newUrl, success }) => {
              if (success) {
                newText = newText.replaceAll(oldUrl, newUrl)
              }
            })

            editor.insertText(newText)
          } catch (error) {
            console.error('????????????????????????:', error)
            message.error('????????????????????????')
          }

          return false
        }
      }
    })
    return () => {
      editor.destroy()
      setEditor(null)
    }
  }, [editor, category])

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
