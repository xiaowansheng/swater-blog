import request from './request'
import { ArchiveVO, Article, PageResult } from '@/types'

export const archiveApi = {
  // 获取所有文章归档统计（管理端）
  getList: () => {
    return request.get<ArchiveVO[]>('/api/admin/archive/list')
  },

  // 根据年月查询文章列表
  getArticlesByYearMonth: (year: number, month: number, page: number = 1, size: number = 10) => {
    return request.get<PageResult<Article>>(
      `/api/public/archive/${year}/${month}?page=${page}&size=${size}`
    )
  }
}
