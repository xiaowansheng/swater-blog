/**
 * 本地草稿存储工具
 * 用于在网络中断时保存文章草稿到本地存储
 *
 * 安全说明：localStorage 可被 XSS 读取，因此：
 * 1) 草稿设置 7 天 TTL，过期自动清理，减少长期暴露窗口；
 * 2) 不存储任何敏感字段（如作者 token / 密码等）；
 * 3) 如需更高安全级别，应改为 IndexedDB + WebCrypto 加密。
 */

const DRAFT_KEY_PREFIX = 'article_draft_'
const DRAFT_LIST_KEY = 'article_draft_list'
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 天

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
  articleKey?: string
}

/**
 * 保存草稿到本地存储
 */
export function saveLocalDraft(articleId: number | undefined, draft: Omit<LocalDraft, 'savedAt'>): void {
  const key = getDraftKey(articleId, draft.articleKey)
  const draftData: LocalDraft = {
    ...draft,
    savedAt: Date.now(),
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(draftData))
    updateDraftList(articleId, draft.articleKey)
  } catch (error) {
    console.error('保存本地草稿失败:', error)
  }
}

/**
 * 获取本地草稿。超过 TTL 的草稿视为过期，自动清理并返回 null。
 */
export function getLocalDraft(articleId: number | undefined, articleKey?: string): LocalDraft | null {
  const key = getDraftKey(articleId, articleKey)

  try {
    const data = localStorage.getItem(key)
    if (data) {
      const draft = JSON.parse(data) as LocalDraft
      // TTL 校验：过期草稿自动清理，避免长期残留可被 XSS 读取
      if (typeof draft.savedAt === 'number' && Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        removeLocalDraft(articleId, articleKey)
        return null
      }
      return draft
    }
  } catch (error) {
    console.error('读取本地草稿失败:', error)
  }

  return null
}

/**
 * 删除本地草稿
 */
export function removeLocalDraft(articleId: number | undefined, articleKey?: string): void {
  const key = getDraftKey(articleId, articleKey)
  
  try {
    localStorage.removeItem(key)
    removeDraftFromList(articleId, articleKey)
  } catch (error) {
    console.error('删除本地草稿失败:', error)
  }
}

/**
 * 获取所有本地草稿列表
 */
export function getAllLocalDrafts(): Array<{ key: string; draft: LocalDraft }> {
  const drafts: Array<{ key: string; draft: LocalDraft }> = []
  const expiredKeys: string[] = []

  try {
    const listData = localStorage.getItem(DRAFT_LIST_KEY)
    if (listData) {
      const keys = JSON.parse(listData) as string[]
      for (const key of keys) {
        const draftData = localStorage.getItem(key)
        if (draftData) {
          const draft = JSON.parse(draftData) as LocalDraft
          // 跳过并清理过期草稿
          if (typeof draft.savedAt === 'number' && Date.now() - draft.savedAt > DRAFT_TTL_MS) {
            expiredKeys.push(key)
            localStorage.removeItem(key)
            continue
          }
          drafts.push({ key, draft })
        }
      }
      // 同步清理过期 key 的索引
      if (expiredKeys.length > 0) {
        const remaining = keys.filter(k => !expiredKeys.includes(k))
        localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(remaining))
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

function getDraftKey(articleId: number | undefined, articleKey?: string): string {
  if (articleKey) {
    return `${DRAFT_KEY_PREFIX}${articleKey}`
  }
  if (articleId) {
    return `${DRAFT_KEY_PREFIX}${articleId}`
  }
  return `${DRAFT_KEY_PREFIX}new`
}

function updateDraftList(articleId: number | undefined, articleKey?: string): void {
  const key = getDraftKey(articleId, articleKey)
  
  try {
    const listData = localStorage.getItem(DRAFT_LIST_KEY)
    const keys: string[] = listData ? JSON.parse(listData) : []
    
    if (!keys.includes(key)) {
      keys.push(key)
      localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(keys))
    }
  } catch (error) {
    console.error('更新草稿列表失败:', error)
  }
}

function removeDraftFromList(articleId: number | undefined, articleKey?: string): void {
  const key = getDraftKey(articleId, articleKey)
  
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
