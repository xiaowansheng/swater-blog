import { useCallback, useEffect, useRef } from 'react'
import { Button } from 'antd'
import { GlobalOutlined, GithubOutlined } from '@ant-design/icons'
import config from '@/config'

// 粒子类型
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  color: string
}

const Welcome: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)

  const initParticles = useCallback((width: number, height: number) => {
    const colors = [
      'rgba(59, 130, 246, ',   // blue
      'rgba(147, 51, 234, ',   // purple
      'rgba(236, 72, 153, ',   // pink
      'rgba(34, 211, 238, ',   // cyan
    ]
    const count = Math.floor((width * height) / 12000)
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const colorBase = colors[Math.floor(Math.random() * colors.length)]
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colorBase,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      initParticles(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const particles = particlesRef.current
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        // 边界回弹
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.opacity})`
        ctx.fill()

        // 绘制连线
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            const lineOpacity = (1 - dist / 120) * 0.15
            ctx.strokeStyle = `${p.color}${lineOpacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [initParticles])

  const handleBlogClick = () => {
    window.open(config.blogUrl, '_blank')
  }

  const handleGithubClick = () => {
    window.open(config.githubUrl, '_blank')
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 112px)',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
    >
      {/* 背景画布，铺满容器且不随滚动 */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* 中心内容 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 112px)',
          gap: 48,
        }}
      >
        {/* 标题区域 */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              marginBottom: 12,
            }}
          >
            欢迎使用博客管理系统
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, margin: 0 }}>
            Blog Admin Dashboard
          </p>
        </div>

        {/* 按钮区域 */}
        <div style={{ display: 'flex', gap: 24 }}>
          <Button
            type="primary"
            size="large"
            icon={<GlobalOutlined />}
            onClick={handleBlogClick}
            style={{
              height: 48,
              paddingInline: 32,
              fontSize: 16,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none',
              boxShadow: '0 4px 24px rgba(59,130,246,0.4)',
            }}
          >
            访问博客
          </Button>
          <Button
            size="large"
            icon={<GithubOutlined />}
            onClick={handleGithubClick}
            style={{
              height: 48,
              paddingInline: 32,
              fontSize: 16,
              borderRadius: 8,
              color: '#fff',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            GitHub
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Welcome
