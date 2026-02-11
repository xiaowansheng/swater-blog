/**
 * 封面图片生成工具
 * 从 CoverGenerator 组件中提取的核心生成逻辑，可在非组件场景中使用（如导入文章时自动生成封面）
 */

// 预设模板（与 CoverGenerator 组件保持一致）
const templates = [
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
  { name: '渐变蓝紫', backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textColor: '#ffffff', accentColor: '#ffd700' },
  { name: '渐变粉红', backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', textColor: '#ffffff', accentColor: '#ffffff' },
  { name: '渐变青蓝', backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', textColor: '#ffffff', accentColor: '#ffffff' },
  { name: '渐变暖橙', backgroundColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', textColor: '#333333', accentColor: '#ff6b6b' },
  { name: '渐变极光', backgroundColor: 'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '渐变星空', backgroundColor: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)', textColor: '#ffffff', accentColor: '#ffd700' },
  { name: '赛博霓虹', backgroundColor: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', textColor: '#00f0ff', accentColor: '#ff00ff' },
  { name: '暗黑科技', backgroundColor: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', textColor: '#00d4ff', accentColor: '#e94560' },
  { name: '春樱', backgroundColor: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)', textColor: '#880e4f', accentColor: '#ad1457' },
  { name: '秋叶', backgroundColor: 'linear-gradient(135deg, #bf360c 0%, #ff8f00 100%)', textColor: '#fff3e0', accentColor: '#ffe0b2' },
  { name: '森林', backgroundColor: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)', textColor: '#e8f5e9', accentColor: '#a5d6a7' },
  { name: '深海', backgroundColor: 'linear-gradient(135deg, #006064 0%, #00838f 100%)', textColor: '#e0f7fa', accentColor: '#4dd0e1' },
  { name: '暗金', backgroundColor: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', textColor: '#d4af37', accentColor: '#ffd700' },
  { name: '午夜蓝', backgroundColor: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', textColor: '#b8d4e3', accentColor: '#64ffda' },
  { name: '彩虹糖', backgroundColor: 'linear-gradient(135deg, #f72585 0%, #b5179e 25%, #7209b7 50%, #560bad 75%, #480ca8 100%)', textColor: '#ffffff', accentColor: '#f9c74f' },
  { name: '火焰', backgroundColor: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', textColor: '#ffffff', accentColor: '#fff' },
  { name: '北极光', backgroundColor: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', textColor: '#ffffff', accentColor: '#e0f7fa' },
  { name: '宇宙尘埃', backgroundColor: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)', textColor: '#e8e8e8', accentColor: '#bb86fc' },
]

// 装饰风格
type DecorationStyle = 'none' | 'circles' | 'lines' | 'grid' | 'waves'
type BorderStyle = 'none' | 'solid' | 'dashed' | 'corner'
type TextureStyle = 'none' | 'dots' | 'lines' | 'noise'

const decorationStyles: DecorationStyle[] = ['none', 'circles', 'lines', 'grid', 'waves']
const borderStyles: BorderStyle[] = ['none', 'solid', 'dashed', 'corner']
const textureStyles: TextureStyle[] = ['none', 'dots', 'lines', 'noise']
const textAligns: CanvasTextAlign[] = ['left', 'center', 'right']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}

/**
 * 用文章标题随机生成一张封面图片
 * @param title 文章标题
 * @returns Blob 对象（PNG 图片）
 */
export function generateCoverBlob(title: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1280
      canvas.height = 720

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'))
        return
      }

      // 随机选取参数
      const template = randomItem(templates)
      const bgColor = template.backgroundColor
      const textColor = template.textColor
      const fontSize = randomInt(48, 120)
      const lineHeight = parseFloat((Math.random() * (2.0 - 1.2) + 1.2).toFixed(1))
      const textAlign = randomItem(textAligns)
      const padding = randomInt(40, 100)
      const decoration = randomItem(decorationStyles)
      const border = randomItem(borderStyles)
      const texture = randomItem(textureStyles)
      const showBorder = Math.random() > 0.3
      const showDecorBar = Math.random() > 0.3

      // 1. 绘制背景
      if (bgColor.includes('gradient')) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        const colors = bgColor.match(/#[a-fA-F0-9]{6}/g)
        if (colors && colors.length >= 2) {
          gradient.addColorStop(0, colors[0])
          gradient.addColorStop(1, colors[colors.length - 1])
        }
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = bgColor
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. 绘制纹理
      ctx.globalAlpha = 0.05
      ctx.fillStyle = textColor
      if (texture === 'dots') {
        const spacing = 20
        for (let x = spacing; x < canvas.width; x += spacing) {
          for (let y = spacing; y < canvas.height; y += spacing) {
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      } else if (texture === 'lines') {
        ctx.strokeStyle = textColor
        ctx.lineWidth = 1
        for (let y = 0; y < canvas.height; y += 15) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
      } else if (texture === 'noise') {
        for (let i = 0; i < 5000; i++) {
          ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
        }
      }
      ctx.globalAlpha = 1.0

      // 3. 绘制装饰图案
      ctx.globalAlpha = 0.1
      ctx.fillStyle = textColor
      if (decoration === 'circles') {
        for (let i = 0; i < 5; i++) {
          ctx.beginPath()
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 100 + 50, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (decoration === 'lines') {
        for (let i = 0; i < 10; i++) {
          ctx.fillRect(Math.random() * canvas.width, 0, 2, canvas.height)
        }
      } else if (decoration === 'grid') {
        const gridSize = 80
        ctx.lineWidth = 1
        ctx.strokeStyle = textColor
        for (let x = 0; x <= canvas.width; x += gridSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
        }
      } else if (decoration === 'waves') {
        ctx.lineWidth = 2
        ctx.strokeStyle = textColor
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          const yOffset = (canvas.height / 4) * (i + 1)
          for (let x = 0; x <= canvas.width; x += 10) {
            const y = yOffset + Math.sin(x * 0.02) * 30
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1.0

      // 4. 绘制文字
      ctx.font = `bold ${fontSize}px "Microsoft YaHei", "Source Han Sans CN", sans-serif`
      ctx.textAlign = textAlign
      ctx.textBaseline = 'middle'

      let x: number
      if (textAlign === 'left') x = padding
      else if (textAlign === 'right') x = canvas.width - padding
      else x = canvas.width / 2

      // 自动换行
      const maxWidth = canvas.width - padding * 2
      const words = title.split('')
      const lines: string[] = []
      let currentLine = ''

      for (const char of words) {
        const testLine = currentLine + char
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine)
          currentLine = char
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) lines.push(currentLine)

      const lineHeightPx = fontSize * lineHeight
      const totalHeight = lines.length * lineHeightPx
      const startY = (canvas.height - totalHeight) / 2 + lineHeightPx / 2

      ctx.fillStyle = textColor
      lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + index * lineHeightPx)
      })

      // 5. 装饰条
      if (showDecorBar) {
        const barHeight = 8
        const barWidth = 200
        const barY = canvas.height - padding / 2
        let barX: number
        if (textAlign === 'left') barX = padding
        else if (textAlign === 'right') barX = canvas.width - padding - barWidth
        else barX = (canvas.width - barWidth) / 2
        ctx.fillStyle = template.accentColor
        ctx.fillRect(barX, barY, barWidth, barHeight)
      }

      // 6. 边框
      if (showBorder && border !== 'none') {
        ctx.strokeStyle = textColor
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.3
        if (border === 'solid') {
          ctx.strokeRect(padding / 2, padding / 2, canvas.width - padding, canvas.height - padding)
        } else if (border === 'dashed') {
          ctx.setLineDash([15, 10])
          ctx.strokeRect(padding / 2, padding / 2, canvas.width - padding, canvas.height - padding)
          ctx.setLineDash([])
        } else if (border === 'corner') {
          const cornerLength = 60
          const p = padding / 2
          // 四个角
          ctx.beginPath(); ctx.moveTo(p, p + cornerLength); ctx.lineTo(p, p); ctx.lineTo(p + cornerLength, p); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(canvas.width - p - cornerLength, p); ctx.lineTo(canvas.width - p, p); ctx.lineTo(canvas.width - p, p + cornerLength); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(canvas.width - p, canvas.height - p - cornerLength); ctx.lineTo(canvas.width - p, canvas.height - p); ctx.lineTo(canvas.width - p - cornerLength, canvas.height - p); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(p + cornerLength, canvas.height - p); ctx.lineTo(p, canvas.height - p); ctx.lineTo(p, canvas.height - p - cornerLength); ctx.stroke()
        }
        ctx.globalAlpha = 1.0
      }

      // 转成 Blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas toBlob 失败'))
        }
      }, 'image/png', 0.9)
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * 将 Blob 转换为 File 对象
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type })
}
