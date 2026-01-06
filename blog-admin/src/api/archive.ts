import request from './request'
import { ArchiveVO } from '@/types'

export const archiveApi = {
  // 获取所有文章归档统计（管理端）
  getList: () => {
    return request.get<ArchiveVO[]>('/api/admin/archive/list')
  }
}
