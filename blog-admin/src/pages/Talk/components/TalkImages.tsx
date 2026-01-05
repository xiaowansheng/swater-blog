import Image from '@/components/common/ImageWithPreview'
import { EyeOutlined } from '@ant-design/icons'

interface TalkImagesProps {
  images?: string[]
}

/**
 * 说说图片网格组件
 * - 1张图片：单列，最大高度400px
 * - 2-4张图片：2列网格
 * - 5-9张图片：3列网格
 * - 超过9张：第9张显示+N
 * - 支持预览和左右滑动
 * - 点击图片时阻止冒泡，不触发卡片点击
 */
const TalkImages: React.FC<TalkImagesProps> = ({ images }) => {
  if (!images || images.length === 0) return null

  const displayImages = images.slice(0, 9)
  const extraCount = images.length - 9

  // 根据图片数量确定网格布局
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count <= 4) return 'grid-cols-2'
    return 'grid-cols-3'
  }

  return (
    <div className={`grid gap-2 mt-4 ${getGridClass(images.length)}`} onClick={(e) => e.stopPropagation()}>
      <Image.PreviewGroup>
        {displayImages.map((img, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden rounded-lg cursor-pointer
              ${images.length === 1 ? 'max-h-[400px]' : 'aspect-square'}
            `}
          >
            <Image
              src={img}
              alt={`图片${index + 1}`}
              className={`
                object-cover transition-transform duration-300
                ${images.length === 1 ? 'w-full h-full' : 'w-full h-full'}
              `}
              style={
                images.length === 1
                  ? { width: '100%', height: '400px' }
                  : { width: '100%', height: '100%' }
              }
              preview={{
                mask: (
                  <div className="flex items-center justify-center w-full h-full bg-black/30">
                    <EyeOutlined className="text-white text-2xl" />
                  </div>
                ),
              }}
            />

            {/* 第9张图片显示"+N" */}
            {index === 8 && extraCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-lg font-medium">+{extraCount}</span>
              </div>
            )}
          </div>
        ))}
      </Image.PreviewGroup>
    </div>
  )
}

export default TalkImages
