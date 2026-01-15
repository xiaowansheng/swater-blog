import { useState, useEffect, useRef } from 'react'
import { Modal, Input, Select, Slider, Button, Space, ColorPicker, Radio, Divider, message } from 'antd'
import { BgColorsOutlined, FontSizeOutlined, LineHeightOutlined, ColumnHeightOutlined } from '@ant-design/icons'
import type { Color } from 'antd/es/color-picker'

const { TextArea } = Input
const { Option } = Select

interface CoverGeneratorProps {
  visible: boolean
  onCancel: () => void
  onConfirm: (imageUrl: string) => void
  initialText?: string
}

// 预设模板
const templates = [
  {
    name: '简约白',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#1890ff',
  },
  {
    name: '渐变蓝',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
  },
  {
    name: '活力橙',
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff',
    accentColor: '#ffffff',
  },
  {
    name: '清新绿',
    backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textColor: '#ffffff',
    accentColor: '#ffffff',
  },
  {
    name: '深邃黑',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    accentColor: '#52c41a',
  },
  {
    name: '温暖黄',
    backgroundColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    textColor: '#333333',
    accentColor: '#ff6b6b',
  },
]

// 预设字体
const fonts = [
  { name: '微软雅黑', family: 'Microsoft YaHei, sans-serif' },
  { name: '思源黑体', family: 'Source Han Sans CN, sans-serif' },
  { name: '宋体', family: 'SimSun, serif' },
  { name: '黑体', family: 'SimHei, sans-serif' },
  { name: '楷体', family: 'KaiTi, serif' },
]

const CoverGenerator: React.FC<CoverGeneratorProps> = ({
  visible,
  onCancel,
  onConfirm,
  initialText = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState(initialText)
  const [template, setTemplate] = useState(0)
  const [fontSize, setFontSize] = useState(48)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center')
  const [padding, setPadding] = useState(60)
  const [customBgColor, setCustomBgColor] = useState<Color>('#ffffff')
  const [customTextColor, setCustomTextColor] = useState<Color>('#333333')
  const [useCustomColor, setUseCustomColor] = useState(false)

  // 自动生成封面
  const generateCover = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置canvas尺寸 (16:9)
    canvas.width = 1280
    canvas.height = 720

    const currentTemplate = templates[template]
    const bgColor = useCustomColor ? customBgColor.toHexString() : currentTemplate.backgroundColor
    const textColor = useCustomColor ? customTextColor.toHexString() : currentTemplate.textColor

    // 绘制背景
    if (bgColor.includes('gradient')) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      // 解析渐变色
      const colors = bgColor.match(/#[a-fA-F0-9]{6}/g)
      if (colors && colors.length >= 2) {
        gradient.addColorStop(0, colors[0])
        gradient.addColorStop(1, colors[1])
      }
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = bgColor
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制装饰性图案
    ctx.globalAlpha = 0.1
    ctx.fillStyle = textColor
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 100 + 50
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1.0

    // 绘制文字
    ctx.fillStyle = textColor
    ctx.font = `bold ${fontSize}px ${fonts[0].family}`
    ctx.textAlign = textAlign
    ctx.textBaseline = 'middle'

    // 计算文字位置
    let x: number
    if (textAlign === 'left') {
      x = padding
    } else if (textAlign === 'right') {
      x = canvas.width - padding
    } else {
      x = canvas.width / 2
    }

    // 处理多行文字
    const lines = text.split('\n')
    const lineHeightPx = fontSize * lineHeight
    const totalHeight = lines.length * lineHeightPx
    let startY = (canvas.height - totalHeight) / 2 + lineHeightPx / 2

    lines.forEach((line, index) => {
      const y = startY + index * lineHeightPx
      ctx.fillText(line, x, y)
    })

    // 添加底部装饰条
    const barHeight = 8
    const barWidth = 200
    const barY = canvas.height - padding / 2
    let barX: number
    if (textAlign === 'left') {
      barX = padding
    } else if (textAlign === 'right') {
      barX = canvas.width - padding - barWidth
    } else {
      barX = (canvas.width - barWidth) / 2
    }

    ctx.fillStyle = currentTemplate.accentColor
    ctx.fillRect(barX, barY, barWidth, barHeight)

    // 添加边框
    ctx.strokeStyle = textColor
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.3
    ctx.strokeRect(padding / 2, padding / 2, canvas.width - padding, canvas.height - padding)
    ctx.globalAlpha = 1.0
  }

  // 确认并保存
  const handleConfirm = () => {
    if (!text.trim()) {
      message.warning('请输入封面文字')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    // 转换为图片URL
    const imageUrl = canvas.toDataURL('image/png', 0.9)
    onConfirm(imageUrl)
    onCancel()
  }

  // 实时预览
  useEffect(() => {
    if (visible) {
      generateCover()
    }
  }, [visible, text, template, fontSize, lineHeight, textAlign, padding, customBgColor, customTextColor, useCustomColor])

  return (
    <Modal
      title="生成文章封面"
      open={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      width={1000}
      okText="使用此封面"
      cancelText="取消"
    >
      <div style={{ display: 'flex', gap: 24 }}>
        {/* 左侧：预览区域 */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 16, fontWeight: 'bold', fontSize: 16 }}>预览效果</div>
          <div
            style={{
              width: '100%',
              paddingBottom: '56.25%',
              position: 'relative',
              background: '#f0f0f0',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* 右侧：控制面板 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 文字输入 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              <FontSizeOutlined /> 封面文字
            </div>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入封面文字，支持多行&#10;建议：10-20个字效果最佳"
              rows={4}
              maxLength={100}
              showCount
            />
          </div>

          <Divider />

          {/* 模板选择 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              <BgColorsOutlined /> 选择模板
            </div>
            <Radio.Group
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
            >
              {templates.map((t, index) => (
                <Radio.Button key={index} value={index} style={{ marginRight: 0 }}>
                  {t.name}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* 自定义颜色 */}
          <div>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>自定义颜色</span>
              <input
                type="checkbox"
                checked={useCustomColor}
                onChange={(e) => setUseCustomColor(e.target.checked)}
              />
            </div>
            {useCustomColor && (
              <Space>
                <div>
                  <span style={{ marginRight: 8 }}>背景色：</span>
                  <ColorPicker
                    value={customBgColor}
                    onChange={setCustomBgColor}
                    showText
                  />
                </div>
                <div>
                  <span style={{ marginRight: 8 }}>文字色：</span>
                  <ColorPicker
                    value={customTextColor}
                    onChange={setCustomTextColor}
                    showText
                  />
                </div>
              </Space>
            )}
          </div>

          <Divider />

          {/* 字体大小 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              <FontSizeOutlined /> 字体大小: {fontSize}px
            </div>
            <Slider
              min={24}
              max={96}
              value={fontSize}
              onChange={(value) => setFontSize(value)}
            />
          </div>

          {/* 行高 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              <LineHeightOutlined /> 行高: {lineHeight}
            </div>
            <Slider
              min={1.0}
              max={2.5}
              step={0.1}
              value={lineHeight}
              onChange={(value) => setLineHeight(value)}
            />
          </div>

          {/* 对齐方式 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              <ColumnHeightOutlined /> 对齐方式
            </div>
            <Radio.Group
              value={textAlign}
              onChange={(e) => setTextAlign(e.target.value)}
            >
              <Radio.Button value="left">左对齐</Radio.Button>
              <Radio.Button value="center">居中</Radio.Button>
              <Radio.Button value="right">右对齐</Radio.Button>
            </Radio.Group>
          </div>

          {/* 边距 */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              边距: {padding}px
            </div>
            <Slider
              min={20}
              max={120}
              value={padding}
              onChange={(value) => setPadding(value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CoverGenerator
