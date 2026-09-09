import request from './request'
import { ArchiveVO, Article, PageResult } from '@/types'

export const archiveApi = {
  // 获取所有文章归档统计（管理端）
  getList: (): Promise<ArchiveVO[]> => {
    return request.get('/admin/archive/list')
  },

  // 按年月查询文章列表（管理端，含各状态文章）
  getArticlesByYearMonth: (year: number, month: number, page: number = 1, size: number = 100): Promise<PageResult<Article>> => {
    return request.get('/admin/archive/articles', {
      params: { year, month, page, size },
    })
  },
}
