import { Suspense } from 'react'
import { ImportContent } from '@/components/import/ImportContent'

export const dynamic = 'force-dynamic'

export default async function ImportPage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">从语雀导入</h2>
        <p className="text-gray-600 mt-1">
          选择语雀文档并导入到博客数据库
        </p>
      </div>

      {/* 导入内容 */}
      <Suspense fallback={<div>加载中...</div>}>
        <ImportContent />
      </Suspense>
    </div>
  )
}
