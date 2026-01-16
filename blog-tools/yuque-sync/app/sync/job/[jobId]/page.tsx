import { JobProgress } from '@/components/job/JobProgress'

export const dynamic = 'force-dynamic'

export default async function JobPage({
  params,
}: {
  params: { jobId: string }
}) {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">任务进度</h2>
        <p className="text-gray-600 mt-1">
          实时查看同步任务的执行进度
        </p>
      </div>

      {/* 任务进度 */}
      <JobProgress jobId={params.jobId} />
    </div>
  )
}
