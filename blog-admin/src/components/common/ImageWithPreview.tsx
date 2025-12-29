import React from 'react'
import { Image, ImageProps } from 'antd'
import { getFullUrl } from '@/utils/format'

interface ImageWithPreviewProps extends Omit<ImageProps, 'src'> {
  /**
   * 图片路径（可以是相对路径或绝对路径）
   */
  src?: string
  /**
   * 是否启用预览，默认为 true
   */
  previewEnabled?: boolean
  /**
   * 容器类名
   */
  wrapperClassName?: string
}

/**
 * 包装后的图片组件
 * 1. 自动处理路径拼接（相对路径自动补全前缀）
 * 2. 支持预览功能的开关
 * 3. 继承 antd Image 的所有属性
 */
const ImageWithPreview: React.FC<ImageWithPreviewProps> & {
  PreviewGroup: typeof Image.PreviewGroup
} = ({
  src,
  previewEnabled = true,
  preview,
  wrapperClassName,
  ...restProps
}) => {
  const fullUrl = getFullUrl(src)

  const previewConfig = previewEnabled 
    ? (preview === undefined ? true : preview) 
    : false

  return (
    <Image
      src={fullUrl}
      preview={previewConfig}
      wrapperClassName={wrapperClassName}
      {...restProps}
    />
  )
}

ImageWithPreview.PreviewGroup = Image.PreviewGroup

export default ImageWithPreview
