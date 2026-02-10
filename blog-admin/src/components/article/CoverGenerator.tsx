import { useState, useEffect, useRef } from 'react'
import { Modal, Input, Slider, Button, Space, ColorPicker, Radio, Divider, message, Checkbox } from 'antd'
import { BgColorsOutlined, FontSizeOutlined, LineHeightOutlined, ColumnHeightOutlined, PictureOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface CoverGeneratorProps {
  visible: boolean
  onCancel: () => void
  onConfirm: (imageUrl: string) => void
  initialText?: string
}

// 装饰样式枚举
enum DecorationStyle {
  NONE = 'none',
  CIRCLES = 'circles',
  LINES = 'lines',
  GRID = 'grid',
  WAVES = 'waves',
}

// 阴影效果枚举
enum ShadowStyle {
  NONE = 'none',
  SOFT = 'soft',
  HARD = 'hard',
  GLOW = 'glow',
}

// 文字描边样式枚举
enum TextStrokeStyle {
  NONE = 'none',
  THIN = 'thin',
  MEDIUM = 'medium',
  THICK = 'thick',
}

// 边框样式枚举
enum BorderStyle {
  NONE = 'none',
  SOLID = 'solid',
  DASHED = 'dashed',
  DOUBLE = 'double',
  CORNER = 'corner',
}

// 纹理效果枚举
enum TextureStyle {
  NONE = 'none',
  DOTS = 'dots',
  LINES = 'lines',
  NOISE = 'noise',
}

// 预设模板
const templates = [
  // ===== 经典纯色 =====
  { name: '简约白', backgroundColor: '#ffffff', textColor: '#333333', accentColor: '#1890ff' },
  { name: '深邃黑', backgroundColor: '#1a1a1a', textColor: '#ffffff', accentColor: '#52c41a' },
  { name: '活力橙', backgroundColor: '#ff6b35', textColor: '#ffffff', accentColor: '#fff700' },
  { name: '薄荷绿', backgroundColor: '#00b894', textColor: '#ffffff', accentColor: '#fdcb6e' },
  { name: '深海蓝', backgroundColor: '#0984e3', textColor: '#ffffff', accentColor: '#fdcb6e' },
  { name: '樱花粉', backgroundColor: '#fd79a8', textColor: '#ffffff', accentColor: '#fff' },
  { name: '优雅紫', backgroundColor: '#6c5ce7', textColor: '#ffffff', accentColor: '#ffeaa7' },
  { name: '活力红', backgroundColor: '#d63031', textColor: '#ffffff', accentColor: '#ffeaa7' },
  { name: '暗夜灰', backgroundColor: '#2d3436', textColor: '#ffffff', accentColor: '#00cec9' },
  { name: '奶茶色', backgroundColor: '#f5f0e6', textColor: '#2d3436', accentColor: '#e17055' },
  { name: '墨绿', backgroundColor: '#1b4332', textColor: '#d8f3dc', accentColor: '#95d5b2' },
  { name: '藏蓝', backgroundColor: '#003566', textColor: '#ffffff', accentColor: '#ffc300' },
  { name: '酒红', backgroundColor: '#590d22', textColor: '#fff0f3', accentColor: '#ff758f' },
  { name: '琥珀', backgroundColor: '#b08968', textColor: '#ffffff', accentColor: '#ede0d4' },
  { name: '石板蓝', backgroundColor: '#334155', textColor: '#e2e8f0', accentColor: '#38bdf8' },
  { name: '象牙白', backgroundColor: '#faf3e0', textColor: '#4a4a4a', accentColor: '#d4a574' },
  { name: '深紫', backgroundColor: '#240046', textColor: '#e0aaff', accentColor: '#c77dff' },
  { name: '靛青', backgroundColor: '#023e8a', textColor: '#caf0f8', accentColor: '#48cae4' },
  // ===== 经典渐变 =====
  { name: '渐变蓝紫', backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textColor: '#ffffff', accentColor: '#ffd700' },
  { name: '渐变粉红', backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', textColor: '#ffffff', accentColor: '#ffffff' },
  { name: '渐变青蓝', backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', textColor: '#ffffff', accentColor: '#ffffff' },
  { name: '渐变暖橙', backgroundColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', textColor: '#333333', accentColor: '#ff6b6b' },
  { name: '渐落紫', backgroundColor: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '渐变极光', backgroundColor: 'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '渐变星空', backgroundColor: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)', textColor: '#ffffff', accentColor: '#ffd700' },
  { name: '渐变日落', backgroundColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '渐变海洋', backgroundColor: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '清新绿', backgroundColor: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '渐变深蓝', backgroundColor: 'linear-gradient(135deg, #232526 0%, #414345 100%)', textColor: '#ffffff', accentColor: '#00cec9' },
  { name: '渐变绿意', backgroundColor: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '渐变玫瑰', backgroundColor: 'linear-gradient(135deg, #cc2b5e 0%, #753a88 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '渐变金黄', backgroundColor: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', textColor: '#333333', accentColor: '#fff' },
  // ===== 赛博朋克 & 科技 =====
  { name: '赛博霓虹', backgroundColor: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', textColor: '#00f0ff', accentColor: '#ff00ff' },
  { name: '暗黑科技', backgroundColor: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', textColor: '#00d4ff', accentColor: '#e94560' },
  { name: '矩阵绿', backgroundColor: '#0d1117', textColor: '#00ff41', accentColor: '#39d353' },
  { name: '电光紫', backgroundColor: 'linear-gradient(135deg, #12002e 0%, #2d1b69 100%)', textColor: '#bf5af2', accentColor: '#ff375f' },
  { name: '量子蓝', backgroundColor: 'linear-gradient(135deg, #020024 0%, #090979 50%, #00d4ff 100%)', textColor: '#ffffff', accentColor: '#00d4ff' },
  // ===== 自然 & 四季 =====
  { name: '春樱', backgroundColor: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)', textColor: '#880e4f', accentColor: '#ad1457' },
  { name: '夏日', backgroundColor: 'linear-gradient(135deg, #f9a825 0%, #ff6f00 100%)', textColor: '#ffffff', accentColor: '#fff9c4' },
  { name: '秋叶', backgroundColor: 'linear-gradient(135deg, #bf360c 0%, #ff8f00 100%)', textColor: '#fff3e0', accentColor: '#ffe0b2' },
  { name: '冬雪', backgroundColor: 'linear-gradient(135deg, #cfd8dc 0%, #eceff1 100%)', textColor: '#263238', accentColor: '#546e7a' },
  { name: '森林', backgroundColor: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)', textColor: '#e8f5e9', accentColor: '#a5d6a7' },
  { name: '沙漠', backgroundColor: 'linear-gradient(135deg, #e0c3a0 0%, #d4a574 100%)', textColor: '#3e2723', accentColor: '#795548' },
  { name: '深海', backgroundColor: 'linear-gradient(135deg, #006064 0%, #00838f 100%)', textColor: '#e0f7fa', accentColor: '#4dd0e1' },
  { name: '极地冰川', backgroundColor: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)', textColor: '#0d47a1', accentColor: '#1565c0' },
  // ===== 复古 & 文艺 =====
  { name: '复古牛皮纸', backgroundColor: '#d4a574', textColor: '#3e2723', accentColor: '#5d4037' },
  { name: '老报纸', backgroundColor: '#f5f0dc', textColor: '#2c2c2c', accentColor: '#8b0000' },
  { name: '暗红复古', backgroundColor: 'linear-gradient(135deg, #2c1320 0%, #6b2645 100%)', textColor: '#f5deb3', accentColor: '#daa520' },
  { name: '怀旧蓝', backgroundColor: '#4a6fa5', textColor: '#eee8d5', accentColor: '#fdf6e3' },
  { name: '胶片', backgroundColor: 'linear-gradient(135deg, #3c3b3f 0%, #605c3c 100%)', textColor: '#faf0ca', accentColor: '#e0c097' },
  // ===== 柔和马卡龙 =====
  { name: '马卡龙蓝', backgroundColor: '#a8d8ea', textColor: '#2c3e50', accentColor: '#3498db' },
  { name: '马卡龙粉', backgroundColor: '#ffcad4', textColor: '#6b4c5a', accentColor: '#e75480' },
  { name: '马卡龙绿', backgroundColor: '#b5ead7', textColor: '#2d5a3d', accentColor: '#27ae60' },
  { name: '马卡龙紫', backgroundColor: '#c9b1ff', textColor: '#3d2c5e', accentColor: '#7c4dff' },
  { name: '马卡龙黄', backgroundColor: '#fff1b8', textColor: '#5d4e37', accentColor: '#f5a623' },
  // ===== 高级暗色 =====
  { name: '暗金', backgroundColor: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', textColor: '#d4af37', accentColor: '#ffd700' },
  { name: '暗银', backgroundColor: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)', textColor: '#c0c0c0', accentColor: '#e8e8e8' },
  { name: '深空', backgroundColor: 'linear-gradient(135deg, #0b0b1a 0%, #1a1a3e 100%)', textColor: '#8b8bcd', accentColor: '#6c63ff' },
  { name: '碳灰', backgroundColor: '#1e1e1e', textColor: '#a0a0a0', accentColor: '#ff6b6b' },
  { name: '午夜蓝', backgroundColor: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', textColor: '#b8d4e3', accentColor: '#64ffda' },
  // ===== 创意渐变 =====
  { name: '彩虹糖', backgroundColor: 'linear-gradient(135deg, #f72585 0%, #b5179e 25%, #7209b7 50%, #560bad 75%, #480ca8 100%)', textColor: '#ffffff', accentColor: '#f9c74f' },
  { name: '薰衣草', backgroundColor: 'linear-gradient(135deg, #e8d5f5 0%, #c39bd3 100%)', textColor: '#4a235a', accentColor: '#7d3c98' },
  { name: '火焰', backgroundColor: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '极光绿', backgroundColor: 'linear-gradient(135deg, #004d40 0%, #00e676 100%)', textColor: '#e0f2f1', accentColor: '#69f0ae' },
  { name: '珊瑚橘', backgroundColor: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '北极光', backgroundColor: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', textColor: '#ffffff', accentColor: '#e0f7fa' },
  { name: '蜜桃', backgroundColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)', textColor: '#5d3a1a', accentColor: '#e17055' },
  { name: '宇宙尘埃', backgroundColor: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)', textColor: '#e8e8e8', accentColor: '#bb86fc' },
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
  const [fontSize, setFontSize] = useState(72)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center')
  const [padding, setPadding] = useState(60)
  const [customBgColor, setCustomBgColor] = useState<string>('#ffffff')
  const [customTextColor, setCustomTextColor] = useState<string>('#333333')
  const [useCustomColor, setUseCustomColor] = useState(false)

  // 新增样式配置
  const [selectedFont, setSelectedFont] = useState(0)
  const [decorationStyle, setDecorationStyle] = useState<DecorationStyle>(DecorationStyle.CIRCLES)
  const [shadowStyle, setShadowStyle] = useState<ShadowStyle>(ShadowStyle.NONE)
  const [showBorder, setShowBorder] = useState(true)
  const [showDecorBar, setShowDecorBar] = useState(true)

  // 新增效果配置
  const [textStrokeStyle, setTextStrokeStyle] = useState<TextStrokeStyle>(TextStrokeStyle.NONE)
  const [borderStyle, setBorderStyle] = useState<BorderStyle>(BorderStyle.SOLID)
  const [textureStyle, setTextureStyle] = useState<TextureStyle>(TextureStyle.NONE)
  const [opacity, setOpacity] = useState(1.0)

  // 每次打开时同步 initialText（如文章标题）到封面文字
  useEffect(() => {
    if (visible && initialText) {
      setText(initialText)
    }
  }, [visible, initialText])

  // 随机样式
  const randomizeStyle = () => {
    setTemplate(Math.floor(Math.random() * templates.length))
    setSelectedFont(Math.floor(Math.random() * fonts.length))
    setFontSize(Math.floor(Math.random() * (200 - 40) + 40))
    setLineHeight(parseFloat((Math.random() * (2.0 - 1.2) + 1.2).toFixed(1)))
    setTextAlign(['left', 'center', 'right'][Math.floor(Math.random() * 3)] as 'left' | 'center' | 'right')
    setPadding(Math.floor(Math.random() * (100 - 40) + 40))
    setDecorationStyle(Object.values(DecorationStyle)[Math.floor(Math.random() * Object.values(DecorationStyle).length)])
    setShadowStyle(Object.values(ShadowStyle)[Math.floor(Math.random() * Object.values(ShadowStyle).length)])
    setTextStrokeStyle(Object.values(TextStrokeStyle)[Math.floor(Math.random() * Object.values(TextStrokeStyle).length)])
    setBorderStyle(Object.values(BorderStyle)[Math.floor(Math.random() * Object.values(BorderStyle).length)])
    setTextureStyle(Object.values(TextureStyle)[Math.floor(Math.random() * Object.values(TextureStyle).length)])
    setOpacity(parseFloat((Math.random() * (1.0 - 0.7) + 0.7).toFixed(2)))
    setShowBorder(Math.random() > 0.3)
    setShowDecorBar(Math.random() > 0.3)
    setUseCustomColor(false)
    message.success('已生成随机样式')
  }

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
    const bgColor = useCustomColor ? customBgColor : currentTemplate.backgroundColor
    const textColor = useCustomColor ? customTextColor : currentTemplate.textColor

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

    // 绘制纹理效果
    ctx.globalAlpha = 0.05
    ctx.fillStyle = textColor

    if (textureStyle === TextureStyle.DOTS) {
      const spacing = 20
      for (let x = spacing; x < canvas.width; x += spacing) {
        for (let y = spacing; y < canvas.height; y += spacing) {
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (textureStyle === TextureStyle.LINES) {
      ctx.strokeStyle = textColor
      ctx.lineWidth = 1
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    } else if (textureStyle === TextureStyle.NOISE) {
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        ctx.fillRect(x, y, 2, 2)
      }
    }
    ctx.globalAlpha = 1.0

    // 绘制装饰性图案
    ctx.globalAlpha = 0.1
    ctx.fillStyle = textColor

    if (decorationStyle === DecorationStyle.CIRCLES) {
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 100 + 50
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (decorationStyle === DecorationStyle.LINES) {
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width
        ctx.fillRect(x, 0, 2, canvas.height)
      }
    } else if (decorationStyle === DecorationStyle.GRID) {
      const gridSize = 80
      ctx.lineWidth = 1
      ctx.strokeStyle = textColor
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    } else if (decorationStyle === DecorationStyle.WAVES) {
      ctx.lineWidth = 2
      ctx.strokeStyle = textColor
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        const yOffset = (canvas.height / 4) * (i + 1)
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = yOffset + Math.sin(x * 0.02) * 30
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1.0

    // 绘制文字
    ctx.font = `bold ${fontSize}px ${fonts[selectedFont].family}`
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

    // 绘制文字描边
    if (textStrokeStyle !== TextStrokeStyle.NONE) {
      let strokeWidth = 2
      if (textStrokeStyle === TextStrokeStyle.MEDIUM) strokeWidth = 4
      if (textStrokeStyle === TextStrokeStyle.THICK) strokeWidth = 6

      ctx.strokeStyle = useCustomColor ? customBgColor : (bgColor.includes('gradient') ? '#ffffff' : bgColor)
      ctx.lineWidth = strokeWidth
      ctx.lineJoin = 'round'

      lines.forEach((line, index) => {
        const y = startY + index * lineHeightPx
        ctx.strokeText(line, x, y)
      })
    }

    // 应用阴影效果
    if (shadowStyle !== ShadowStyle.NONE) {
      ctx.shadowColor = textColor
      if (shadowStyle === ShadowStyle.SOFT) {
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 3
        ctx.shadowOffsetY = 3
      } else if (shadowStyle === ShadowStyle.HARD) {
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 6
        ctx.shadowOffsetY = 6
      } else if (shadowStyle === ShadowStyle.GLOW) {
        ctx.shadowBlur = 30
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
    }

    // 绘制文字填充
    ctx.fillStyle = textColor
    ctx.globalAlpha = opacity

    lines.forEach((line, index) => {
      const y = startY + index * lineHeightPx
      ctx.fillText(line, x, y)
    })

    // 重置透明度和阴影
    ctx.globalAlpha = 1.0
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // 添加底部装饰条
    if (showDecorBar) {
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
    }

    // 添加边框
    if (showBorder) {
      ctx.strokeStyle = textColor
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.3

      if (borderStyle === BorderStyle.SOLID) {
        ctx.strokeRect(padding / 2, padding / 2, canvas.width - padding, canvas.height - padding)
      } else if (borderStyle === BorderStyle.DASHED) {
        ctx.setLineDash([15, 10])
        ctx.strokeRect(padding / 2, padding / 2, canvas.width - padding, canvas.height - padding)
        ctx.setLineDash([])
      } else if (borderStyle === BorderStyle.DOUBLE) {
        ctx.lineWidth = 1
        ctx.strokeRect(padding / 2, padding / 2, canvas.width - padding, canvas.height - padding)
        ctx.strokeRect(padding / 2 + 6, padding / 2 + 6, canvas.width - padding - 12, canvas.height - padding - 12)
      } else if (borderStyle === BorderStyle.CORNER) {
        const cornerLength = 60
        const p = padding / 2

        // 左上角
        ctx.beginPath()
        ctx.moveTo(p, p + cornerLength)
        ctx.lineTo(p, p)
        ctx.lineTo(p + cornerLength, p)
        ctx.stroke()

        // 右上角
        ctx.beginPath()
        ctx.moveTo(canvas.width - p - cornerLength, p)
        ctx.lineTo(canvas.width - p, p)
        ctx.lineTo(canvas.width - p, p + cornerLength)
        ctx.stroke()

        // 右下角
        ctx.beginPath()
        ctx.moveTo(canvas.width - p, canvas.height - p - cornerLength)
        ctx.lineTo(canvas.width - p, canvas.height - p)
        ctx.lineTo(canvas.width - p - cornerLength, canvas.height - p)
        ctx.stroke()

        // 左下角
        ctx.beginPath()
        ctx.moveTo(p + cornerLength, canvas.height - p)
        ctx.lineTo(p, canvas.height - p)
        ctx.lineTo(p, canvas.height - p - cornerLength)
        ctx.stroke()
      }

      ctx.globalAlpha = 1.0
    }
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
  }, [visible, text, template, fontSize, lineHeight, textAlign, padding, customBgColor, customTextColor, useCustomColor, selectedFont, decorationStyle, shadowStyle, showBorder, showDecorBar, textStrokeStyle, borderStyle, textureStyle, opacity])

  return (
    <Modal
      title="生成文章封面"
      open={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      width={1100}
      okText="使用此封面"
      cancelText="取消"
      styles={{ body: { height: '55vh', padding: '24px', overflow: 'hidden' } }}
      footer={(
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm}>使用此封面</Button>
        </div>
      )}
    >
      <div style={{ display: 'flex', gap: 24, height: '100%' }}>
        {/* 左侧：预览区域 - 固定 */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 16, fontWeight: 'bold', fontSize: 16 }}>预览效果</div>
          <div
            style={{
              width: '100%',
              paddingBottom: '56.25%',
              position: 'relative',
              background: '#f0f0f0',
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
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

        {/* 右侧：控制面板 - 可滚动 */}
        <div style={{ width: '50%', overflowY: 'auto', paddingRight: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>样式配置</div>
            <Button
              icon={<PictureOutlined />}
              onClick={randomizeStyle}
              type="primary"
              ghost
            >
              随机样式
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <Checkbox checked={useCustomColor} onChange={(e) => setUseCustomColor(e.target.checked)}>
                  自定义颜色
                </Checkbox>
              </div>
              {useCustomColor && (
                <Space style={{ marginLeft: 24 }}>
                  <div>
                    <span style={{ marginRight: 8 }}>背景色：</span>
                    <ColorPicker
                      value={customBgColor}
                      onChange={(_, color) => setCustomBgColor(color)}
                      showText
                    />
                  </div>
                  <div>
                    <span style={{ marginRight: 8 }}>文字色：</span>
                    <ColorPicker
                      value={customTextColor}
                      onChange={(_, color) => setCustomTextColor(color)}
                      showText
                    />
                  </div>
                </Space>
              )}
            </div>

            <Divider />

            {/* 字体选择 */}
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <FontSizeOutlined /> 字体选择
              </div>
              <Radio.Group
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
              >
                {fonts.map((font, index) => (
                  <Radio.Button key={index} value={index} style={{ fontFamily: font.family }}>
                    {font.name}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>

            {/* 装饰样式 */}
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <PictureOutlined /> 装饰样式
              </div>
              <Radio.Group
                value={decorationStyle}
                onChange={(e) => setDecorationStyle(e.target.value)}
              >
                <Radio.Button value={DecorationStyle.NONE}>无</Radio.Button>
                <Radio.Button value={DecorationStyle.CIRCLES}>圆形</Radio.Button>
                <Radio.Button value={DecorationStyle.LINES}>线条</Radio.Button>
                <Radio.Button value={DecorationStyle.GRID}>网格</Radio.Button>
                <Radio.Button value={DecorationStyle.WAVES}>波浪</Radio.Button>
              </Radio.Group>
            </div>

            {/* 阴影效果 */}
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                阴影效果
              </div>
              <Radio.Group
                value={shadowStyle}
                onChange={(e) => setShadowStyle(e.target.value)}
              >
                <Radio.Button value={ShadowStyle.NONE}>无阴影</Radio.Button>
                <Radio.Button value={ShadowStyle.SOFT}>柔和</Radio.Button>
                <Radio.Button value={ShadowStyle.HARD}>硬朗</Radio.Button>
                <Radio.Button value={ShadowStyle.GLOW}>发光</Radio.Button>
              </Radio.Group>
            </div>

            <Divider />

            {/* 字体大小 */}
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <FontSizeOutlined /> 字体大小: {fontSize}px
              </div>
              <Slider
                min={18}
                max={250}
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

            {/* 显示/隐藏选项 */}
            <Divider />
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                显示选项
              </div>
              <Space direction="vertical">
                <Checkbox checked={showBorder} onChange={(e) => setShowBorder(e.target.checked)}>
                  显示边框
                </Checkbox>
                <Checkbox checked={showDecorBar} onChange={(e) => setShowDecorBar(e.target.checked)}>
                  显示装饰条
                </Checkbox>
              </Space>
            </div>

            {/* 文字特效 */}
            <Divider />
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                文字特效
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 8, fontSize: 14 }}>文字描边：</div>
                <Radio.Group
                  value={textStrokeStyle}
                  onChange={(e) => setTextStrokeStyle(e.target.value)}
                  size="small"
                >
                  <Radio.Button value={TextStrokeStyle.NONE}>无</Radio.Button>
                  <Radio.Button value={TextStrokeStyle.THIN}>细</Radio.Button>
                  <Radio.Button value={TextStrokeStyle.MEDIUM}>中</Radio.Button>
                  <Radio.Button value={TextStrokeStyle.THICK}>粗</Radio.Button>
                </Radio.Group>
              </div>
              <div>
                <div style={{ marginBottom: 8, fontSize: 14 }}>文字透明度：{Math.round(opacity * 100)}%</div>
                <Slider
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  value={opacity}
                  onChange={(value) => setOpacity(value)}
                />
              </div>
            </div>

            {/* 边框样式 */}
            <Divider />
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                边框样式
              </div>
              <Radio.Group
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value)}
              >
                <Radio.Button value={BorderStyle.NONE}>无边框</Radio.Button>
                <Radio.Button value={BorderStyle.SOLID}>实线</Radio.Button>
                <Radio.Button value={BorderStyle.DASHED}>虚线</Radio.Button>
                <Radio.Button value={BorderStyle.DOUBLE}>双线</Radio.Button>
                <Radio.Button value={BorderStyle.CORNER}>角标</Radio.Button>
              </Radio.Group>
            </div>

            {/* 纹理效果 */}
            <Divider />
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                纹理效果
              </div>
              <Radio.Group
                value={textureStyle}
                onChange={(e) => setTextureStyle(e.target.value)}
              >
                <Radio.Button value={TextureStyle.NONE}>无</Radio.Button>
                <Radio.Button value={TextureStyle.DOTS}>点阵</Radio.Button>
                <Radio.Button value={TextureStyle.LINES}>横线</Radio.Button>
                <Radio.Button value={TextureStyle.NOISE}>噪点</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CoverGenerator
