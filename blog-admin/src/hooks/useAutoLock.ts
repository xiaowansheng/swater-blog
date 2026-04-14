import { useEffect, useCallback, useRef } from 'react'
import { useLockscreenStore } from '@/store/lockscreen'
import { useAuthStore } from '@/store/auth'

// 自动锁屏时间（毫秒），默认 30 分钟
const AUTO_LOCK_TIME = 30 * 60 * 1000
const ACTIVITY_PERSIST_INTERVAL = 1000

export const useAutoLock = (lockTime: number = AUTO_LOCK_TIME) => {
  const { lockScreen, isLocked, lastActivityAt, updateActivity } = useLockscreenStore()
  const { isAuthenticated } = useAuthStore()
  const isLockedRef = useRef(isLocked)
  const isAuthenticatedRef = useRef(isAuthenticated)
  const lastActivityAtRef = useRef(lastActivityAt)
  const lastPersistedActivityAtRef = useRef(lastActivityAt)

  useEffect(() => {
    isLockedRef.current = isLocked
  }, [isLocked])

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  useEffect(() => {
    lastActivityAtRef.current = lastActivityAt
    lastPersistedActivityAtRef.current = lastActivityAt
  }, [lastActivityAt])

  const clearTimer = useCallback(() => {
    if (window.autoLockTimer) {
      clearTimeout(window.autoLockTimer)
      window.autoLockTimer = undefined
    }
  }, [])

  const scheduleLock = useCallback((activityAt: number) => {
    clearTimer()

    if (!isAuthenticatedRef.current() || isLockedRef.current) {
      return
    }

    const remaining = lockTime - (Date.now() - activityAt)

    if (remaining <= 0) {
      if (!isLockedRef.current) {
        lockScreen()
      }
      return
    }

    window.autoLockTimer = window.setTimeout(() => {
      const currentActivityAt = useLockscreenStore.getState().lastActivityAt ?? activityAt

      if (!isAuthenticatedRef.current() || isLockedRef.current) {
        return
      }

      if (Date.now() - currentActivityAt >= lockTime) {
        lockScreen()
        return
      }

      scheduleLock(currentActivityAt)
    }, remaining)
  }, [clearTimer, lockScreen, lockTime])

  const persistActivity = useCallback((timestamp: number) => {
    lastPersistedActivityAtRef.current = timestamp
    updateActivity(timestamp)
  }, [updateActivity])

  const syncLockState = useCallback(() => {
    if (!isAuthenticatedRef.current() || isLockedRef.current) {
      clearTimer()
      return
    }

    const activityAt = lastActivityAtRef.current ?? lastPersistedActivityAtRef.current ?? Date.now()
    lastActivityAtRef.current = activityAt

    if (!lastPersistedActivityAtRef.current) {
      persistActivity(activityAt)
    }

    scheduleLock(activityAt)
  }, [clearTimer, persistActivity, scheduleLock])

  const flushActivity = useCallback(() => {
    if (!isAuthenticatedRef.current() || isLockedRef.current) {
      return
    }

    const activityAt = lastActivityAtRef.current

    if (activityAt && activityAt !== lastPersistedActivityAtRef.current) {
      persistActivity(activityAt)
    }
  }, [persistActivity])

  const handleActivity = useCallback(() => {
    if (!isAuthenticatedRef.current() || isLockedRef.current) {
      return
    }

    const now = Date.now()
    lastActivityAtRef.current = now
    scheduleLock(now)

    if (
      !lastPersistedActivityAtRef.current ||
      now - lastPersistedActivityAtRef.current >= ACTIVITY_PERSIST_INTERVAL
    ) {
      persistActivity(now)
    }
  }, [persistActivity, scheduleLock])

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      syncLockState()
      return
    }

    flushActivity()
  }, [flushActivity, syncLockState])

  useEffect(() => {
    // 如果未登录或已锁定，不启动自动锁屏
    if (!isAuthenticated() || isLocked) {
      clearTimer()
      return
    }

    syncLockState()

    // 监听用户活动事件
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ]

    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })
    window.addEventListener('focus', syncLockState)
    window.addEventListener('pagehide', flushActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 清理函数
    return () => {
      clearTimer()
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      window.removeEventListener('focus', syncLockState)
      window.removeEventListener('pagehide', flushActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [clearTimer, flushActivity, handleActivity, handleVisibilityChange, isAuthenticated, isLocked, syncLockState])
}

// 扩展 Window 接口以支持定时器属性
declare global {
  interface Window {
    autoLockTimer?: ReturnType<typeof setTimeout>
  }
}
