import { ExportContent } from '@/components/export/ExportContent'

export const dynamic = 'force-dynamic'

export default async function ExportPage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">导出到语雀</h2>
        <p className="text-gray-600 mt-1">
          选择博客文章并导出到语雀知识库
        </p>
      </div>

      {/* 导出内容 */}
      <ExportContent />
    </div>
  )
}
