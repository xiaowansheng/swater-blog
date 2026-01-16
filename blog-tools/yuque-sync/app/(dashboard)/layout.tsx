import Link from 'next/link'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: '仪表盘', icon: '📊' },
  { href: '/config', label: '配置', icon: '⚙️' },
  { href: '/import', label: '导入', icon: '📥' },
  { href: '/export', label: '导出', icon: '📤' },
  { href: '/sync', label: '同步', icon: '🔄' },
  { href: '/mapping', label: '映射', icon: '🔗' },
  { href: '/logs', label: '日志', icon: '📝' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                语雀同步工具
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 侧边栏 */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
