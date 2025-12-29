/**
 * 本地草稿存储工具
 * 用于在网络中断时保存文章草稿到本地存储
 */

const DRAFT_KEY_PREFIX = 'article_draft_'
const DRAFT_LIST_KEY = 'article_draft_list'

export interface LocalDraft {
  id?: number
  title: string
  content: string
  excerpt?: string
  cover?: string
  categoryId?: number
  categoryName?: string
  type?: string
  status?: number
  isTop?: number
  tagIds?: number[]
  tagNames?: string[]
  savedAt: number
  version?: number
}

/**
 * 保存草稿到本地存储
 */
export function saveLocalDraft(articleId: number | undefined, draft: Omit<LocalDraft, 'savedAt'>): void {
  const key = getDraftKey(articleId)
  const draftData: LocalDraft = {
    ...draft,
    savedAt: Date.now(),
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(draftData))
    updateDraftList(articleId)
  } catch (error) {
    console.error('保存本地草稿失败:', error)
  }
}

/**
 * 获取本地草稿
 */
export function getLocalDraft(articleId: number | undefined): LocalDraft | null {
  const key = getDraftKey(articleId)
  
  try {
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data) as LocalDraft
    }
  } catch (error) {
    console.error('读取本地草稿失败:', error)
  }
  
  return null
}

/**
 * 删除本地草稿
 */
export function removeLocalDraft(articleId: number | undefined): void {
  const key = getDraftKey(articleId)
  
  try {
    localStorage.removeItem(key)
    removeDraftFromList(articleId)
  } catch (error) {
    console.error('删除本地草稿失败:', error)
  }
}

/**
 * 获取所有本地草稿列表
 */
export function getAllLocalDrafts(): Array<{ key: string; draft: LocalDraft }> {
  const drafts: Array<{ key: string; draft: LocalDraft }> = []
  
  try {
    const listData = localStorage.getItem(DRAFT_LIST_KEY)
    if (listData) {
      const keys = JSON.parse(listData) as string[]
      for (const key of keys) {
        const draftData = localStorage.getItem(key)
        if (draftData) {
          drafts.push({
            key,
            draft: JSON.parse(draftData) as LocalDraft,
          })
        }
      }
    }
  } catch (error) {
    console.error('获取本地草稿列表失败:', error)
  }
  
  return drafts.sort((a, b) => b.draft.savedAt - a.draft.savedAt)
}

/**
 * 清除所有本地草稿
 */
export function clearAllLocalDrafts(): void {
  try {
    const listData = localStorage.getItem(DRAFT_LIST_KEY)
    if (listData) {
      const keys = JSON.parse(listData) as string[]
      for (const key of keys) {
        localStorage.removeItem(key)
      }
    }
    localStorage.removeItem(DRAFT_LIST_KEY)
  } catch (error) {
    console.error('清除本地草稿失败:', error)
  }
}

/**
 * 检查是否有未同步的本地草稿
 */
export function hasUnsyncedDrafts(): boolean {
  return getAllLocalDrafts().length > 0
}

/**
 * 格式化草稿保存时间
 */
export function formatDraftTime(savedAt: number): string {
  const now = Date.now()
  const diff = now - savedAt
  
  if (diff < 60 * 1000) {
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))} 分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`
  } else {
    return new Date(savedAt).toLocaleString()
  }
}

// 内部辅助函数

function getDraftKey(articleId: number | undefined): string {
  return `${DRAFT_KEY_PREFIX}${articleId || 'new'}`
}

function updateDraftList(articleId: number | undefined): void {
  const key = getDraftKey(articleId)
  
  try {
    const listData = localStorage.getItem(DRAFT_LIST_KEY)
    let keys: string[] = listData ? JSON.parse(listData) : []
    
    if (!keys.includes(key)) {
      keys.push(key)
      localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(keys))
    }
  } catch (error) {
    console.error('更新草稿列表失败:', error)
  }
}

function removeDraftFromList(articleId: number | undefined): void {
  const key = getDraftKey(articleId)
  
  try {
    const listData = localStorage.getItem(DRAFT_LIST_KEY)
    if (listData) {
      let keys: string[] = JSON.parse(listData)
      keys = keys.filter(k => k !== key)
      localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(keys))
    }
  } catch (error) {
    console.error('从草稿列表移除失败:', error)
  }
}
