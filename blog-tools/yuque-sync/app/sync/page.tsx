import { SyncContent } from '@/components/sync/SyncContent'

export const dynamic = 'force-dynamic'

export default async function SyncPage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">双向同步</h2>
        <p className="text-gray-600 mt-1">
          在博客和语雀之间智能同步文章
        </p>
      </div>

      {/* 同步内容 */}
      <SyncContent />
    </div>
  )
}
