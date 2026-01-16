'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/dashboard', label: '仪表盘', icon: '📊' },
  { href: '/config', label: '配置管理', icon: '⚙️' },
  { href: '/import', label: '导入', icon: '📥' },
  { href: '/export', label: '导出', icon: '📤' },
  { href: '/sync', label: '同步', icon: '🔄' },
  { href: '/mapping', label: '映射管理', icon: '🔗' },
  { href: '/logs', label: '日志', icon: '📝' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 mr-8">
              语雀同步工具
            </h1>
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
