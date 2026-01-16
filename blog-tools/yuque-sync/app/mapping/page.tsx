import { MappingContent } from '@/components/mapping/MappingContent'

export const dynamic = 'force-dynamic'

export default async function MappingPage() {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">映射管理</h2>
        <p className="text-gray-600 mt-1">
          查看和管理博客文章与语雀文档的映射关系
        </p>
      </div>

      {/* 映射内容 */}
      <MappingContent />
    </div>
  )
}
