import { useState, useRef, useCallback, useEffect } from 'react'
import { message } from 'antd'
import { saveArticle, ArticleSaveDTO, ArticleSaveResult } from '@/api/article'
import { saveLocalDraft, getLocalDraft, removeLocalDraft, LocalDraft } from '@/utils/localDraft'

// 保存状态枚举
export enum SaveStatus {
  IDLE = 'idle',           // 未保存/空闲
  PENDING = 'pending',     // 等待保存
  SAVING = 'saving',       // 保存中
  SAVED = 'saved',         // 已保存
  ERROR = 'error',         // 保存失败
  CONFLICT = 'conflict',   // 版本冲突
  OFFLINE = 'offline',     // 离线状态
}

// 保存状态信息
export interface SaveState {
  status: SaveStatus
  lastSavedTime: Date | null
  articleId: number | null
  version: number | null
  errorMessage: string | null
  conflictData: {
    serverContent: string
    serverUpdateTime: string
  } | null
}

// Hook配置选项
export interface AutoSaveOptions {
  // 自动保存间隔（毫秒），默认5分钟
  autoSaveInterval?: number
  // 防抖延迟（毫秒），默认500ms
  debounceDelay?: number
  // 是否启用自动保存
  enableAutoSave?: boolean
  // 是否启用内容变更自动保存
  enableContentChangeAutoSave?: boolean
  // 是否启用本地草稿备份
  enableLocalDraft?: boolean
  // 保存成功回调
  onSaveSuccess?: (result: ArticleSaveResult) => void
  // 保存失败回调
  onSaveError?: (error: Error) => void
  // 冲突回调
  onConflict?: (conflictData: { serverContent: string; serverUpdateTime: string }) => void
}

// 默认配置
const DEFAULT_OPTIONS: Required<AutoSaveOptions> = {
  autoSaveInterval: 5 * 60 * 1000, // 5分钟
  debounceDelay: 500,
  enableAutoSave: true,
  enableContentChangeAutoSave: true,
  enableLocalDraft: true,
  onSaveSuccess: () => {},
  onSaveError: () => {},
  onConflict: () => {},
}

export function useArticleAutoSave(options: AutoSaveOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  // 保存状态
  const [saveState, setSaveState] = useState<SaveState>({
    status: SaveStatus.IDLE,
    lastSavedTime: null,
    articleId: null,
    version: null,
    errorMessage: null,
    conflictData: null,
  })

  // 保存队列和锁
  const saveQueueRef = useRef<ArticleSaveDTO[]>([])
  const isSavingRef = useRef(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastContentRef = useRef<string>('')
  const isOnlineRef = useRef(navigator.onLine)

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true
      if (saveState.status === SaveStatus.OFFLINE) {
        setSaveState(prev => ({ ...prev, status: SaveStatus.IDLE }))
        // 网络恢复后，处理队列中的保存请求
        processQueue()
      }
    }

    const handleOffline = () => {
      isOnlineRef.current = false
      setSaveState(prev => ({ 
        ...prev, 
        status: SaveStatus.OFFLINE,
        errorMessage: '网络已断开，内容将在网络恢复后自动保存'
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [saveState.status])

  // 处理保存队列
  const processQueue = useCallback(async () => {
    if (isSavingRef.current || saveQueueRef.current.length === 0) {
      return
    }

    // 取出最新的保存请求（合并之前的请求）
    const latestData = saveQueueRef.current[saveQueueRef.current.length - 1]

    if (!isOnlineRef.current) {
      setSaveState(prev => ({ 
        ...prev, 
        status: SaveStatus.OFFLINE,
        errorMessage: '网络已断开，内容将在网络恢复后自动保存'
      }))
      
      // 离线时保存到本地
      if (config.enableLocalDraft && latestData) {
        saveLocalDraft(latestData.id, {
          id: latestData.id,
          title: latestData.title,
          content: latestData.content,
          excerpt: latestData.excerpt,
          cover: latestData.cover,
          categoryId: latestData.categoryId,
          categoryName: latestData.categoryName,
          type: latestData.type,
          status: latestData.status,
          isTop: latestData.isTop,
          tagIds: latestData.tagIds,
          tagNames: latestData.tagNames,
          version: latestData.clientVersion,
        })
        message.info('已保存到本地草稿')
      }
      return
    }

    isSavingRef.current = true
    saveQueueRef.current = []

    setSaveState(prev => ({ ...prev, status: SaveStatus.SAVING, errorMessage: null }))

    try {
      const result = await saveArticle(latestData)

      if (result.hasConflict) {
        // 处理版本冲突
        setSaveState(prev => ({
          ...prev,
          status: SaveStatus.CONFLICT,
          conflictData: {
            serverContent: result.serverContent || '',
            serverUpdateTime: result.serverUpdateTime || '',
          },
          errorMessage: result.conflictMessage || '文章已被其他用户修改',
        }))
        config.onConflict({
          serverContent: result.serverContent || '',
          serverUpdateTime: result.serverUpdateTime || '',
        })
      } else {
        // 保存成功
        setSaveState(prev => ({
          ...prev,
          status: SaveStatus.SAVED,
          lastSavedTime: new Date(),
          articleId: result.id,
          version: result.version,
          errorMessage: null,
          conflictData: null,
        }))
        
        // 保存成功后删除本地草稿
        if (config.enableLocalDraft) {
          removeLocalDraft(latestData.id)
        }
        
        if (!latestData.autoSave) {
          message.success(result.isNew ? '文章创建成功' : '保存成功')
        }
        
        config.onSaveSuccess(result)
      }
    } catch (error: any) {
      setSaveState(prev => ({
        ...prev,
        status: SaveStatus.ERROR,
        errorMessage: error.message || '保存失败',
      }))
      
      // 保存失败时保存到本地草稿
      if (config.enableLocalDraft) {
        saveLocalDraft(latestData.id, {
          id: latestData.id,
          title: latestData.title,
          content: latestData.content,
          excerpt: latestData.excerpt,
          cover: latestData.cover,
          categoryId: latestData.categoryId,
          categoryName: latestData.categoryName,
          type: latestData.type,
          status: latestData.status,
          isTop: latestData.isTop,
          tagIds: latestData.tagIds,
          tagNames: latestData.tagNames,
          version: latestData.clientVersion,
        })
      }
      
      if (!latestData.autoSave) {
        message.error(error.message || '保存失败')
      }
      
      config.onSaveError(error)
    } finally {
      isSavingRef.current = false
      
      // 继续处理队列中的其他请求
      if (saveQueueRef.current.length > 0) {
        processQueue()
      }
    }
  }, [config])

  // 添加到保存队列
  const addToQueue = useCallback((data: ArticleSaveDTO) => {
    // 如果有相同文章的请求在队列中，替换它
    const existingIndex = saveQueueRef.current.findIndex(
      item => item.id === data.id || (!item.id && !data.id)
    )
    
    if (existingIndex >= 0) {
      saveQueueRef.current[existingIndex] = data
    } else {
      saveQueueRef.current.push(data)
    }

    setSaveState(prev => ({ ...prev, status: SaveStatus.PENDING }))
    processQueue()
  }, [processQueue])

  // 手动保存
  const save = useCallback((data: Omit<ArticleSaveDTO, 'autoSave' | 'clientVersion'>) => {
    const saveData: ArticleSaveDTO = {
      ...data,
      id: saveState.articleId || data.id,
      autoSave: false,
      clientVersion: saveState.version || undefined,
    }
    addToQueue(saveData)
  }, [addToQueue, saveState.articleId, saveState.version])

  // 自动保存
  const autoSave = useCallback((data: Omit<ArticleSaveDTO, 'autoSave' | 'clientVersion'>) => {
    if (!config.enableAutoSave) return

    const saveData: ArticleSaveDTO = {
      ...data,
      id: saveState.articleId || data.id,
      autoSave: true,
      clientVersion: saveState.version || undefined,
    }
    addToQueue(saveData)
  }, [addToQueue, config.enableAutoSave, saveState.articleId, saveState.version])

  // 内容变更触发的防抖自动保存
  const debouncedAutoSave = useCallback((data: Omit<ArticleSaveDTO, 'autoSave' | 'clientVersion'>) => {
    if (!config.enableContentChangeAutoSave) return

    // 检查内容是否真的变化了
    const contentKey = JSON.stringify({ title: data.title, content: data.content })
    if (contentKey === lastContentRef.current) return
    lastContentRef.current = contentKey

    // 清除之前的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      autoSave(data)
    }, config.debounceDelay)
  }, [autoSave, config.debounceDelay, config.enableContentChangeAutoSave])

  // 启动定时自动保存
  const startAutoSaveTimer = useCallback((getData: () => Omit<ArticleSaveDTO, 'autoSave' | 'clientVersion'>) => {
    if (!config.enableAutoSave) return

    // 清除之前的定时器
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setInterval(() => {
      const data = getData()
      if (data.title && data.content) {
        autoSave(data)
      }
    }, config.autoSaveInterval)
  }, [autoSave, config.autoSaveInterval, config.enableAutoSave])

  // 停止定时自动保存
  const stopAutoSaveTimer = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
  }, [])

  // 重试保存
  const retry = useCallback((data: Omit<ArticleSaveDTO, 'autoSave' | 'clientVersion'>) => {
    setSaveState(prev => ({ ...prev, status: SaveStatus.IDLE, errorMessage: null }))
    save(data)
  }, [save])

  // 解决冲突（使用服务器版本）
  const resolveConflictWithServer = useCallback(() => {
    setSaveState(prev => ({
      ...prev,
      status: SaveStatus.IDLE,
      conflictData: null,
      errorMessage: null,
    }))
  }, [])

  // 解决冲突（强制覆盖）
  const resolveConflictWithLocal = useCallback((data: Omit<ArticleSaveDTO, 'autoSave' | 'clientVersion'>) => {
    setSaveState(prev => ({
      ...prev,
      status: SaveStatus.IDLE,
      conflictData: null,
      errorMessage: null,
      version: null, // 清除版本号，强制覆盖
    }))
    save(data)
  }, [save])

  // 初始化文章ID和版本号（编辑已有文章时使用）
  const initArticle = useCallback((id: number, version: number) => {
    setSaveState(prev => ({
      ...prev,
      articleId: id,
      version: version,
    }))
  }, [])

  // 检查并恢复本地草稿
  const checkLocalDraft = useCallback((articleId: number | undefined): LocalDraft | null => {
    if (!config.enableLocalDraft) return null
    return getLocalDraft(articleId)
  }, [config.enableLocalDraft])

  // 清除本地草稿
  const clearLocalDraft = useCallback((articleId: number | undefined) => {
    if (config.enableLocalDraft) {
      removeLocalDraft(articleId)
    }
  }, [config.enableLocalDraft])

  // 清理
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [])

  // 获取保存状态文本
  const getStatusText = useCallback(() => {
    switch (saveState.status) {
      case SaveStatus.IDLE:
        return '未保存'
      case SaveStatus.PENDING:
        return '等待保存...'
      case SaveStatus.SAVING:
        return '保存中...'
      case SaveStatus.SAVED:
        return saveState.lastSavedTime 
          ? `已保存于 ${saveState.lastSavedTime.toLocaleTimeString()}`
          : '已保存'
      case SaveStatus.ERROR:
        return saveState.errorMessage || '保存失败'
      case SaveStatus.CONFLICT:
        return '版本冲突'
      case SaveStatus.OFFLINE:
        return '离线状态'
      default:
        return ''
    }
  }, [saveState])

  return {
    saveState,
    save,
    autoSave,
    debouncedAutoSave,
    startAutoSaveTimer,
    stopAutoSaveTimer,
    retry,
    resolveConflictWithServer,
    resolveConflictWithLocal,
    initArticle,
    checkLocalDraft,
    clearLocalDraft,
    getStatusText,
    isSaving: saveState.status === SaveStatus.SAVING,
    hasError: saveState.status === SaveStatus.ERROR,
    hasConflict: saveState.status === SaveStatus.CONFLICT,
    isOffline: saveState.status === SaveStatus.OFFLINE,
  }
}

export default useArticleAutoSave
