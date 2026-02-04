import { useEffect, useCallback, useRef } from 'react'
import { useLockscreenStore } from '@/store/lockscreen'
import { useAuthStore } from '@/store/auth'

// 自动锁屏时间（毫秒），默认 30 分钟
const AUTO_LOCK_TIME = 30 * 60 * 1000

export const useAutoLock = (lockTime: number = AUTO_LOCK_TIME) => {
  const { lockScreen, isLocked } = useLockscreenStore()
  const { isAuthenticated } = useAuthStore()
  const isLockedRef = useRef(isLocked)
  const isAuthenticatedRef = useRef(isAuthenticated)

  useEffect(() => {
    isLockedRef.current = isLocked
  }, [isLocked])

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  const resetTimer = useCallback(() => {
    // 移除旧的定时器
    if (window.autoLockTimer) {
      clearTimeout(window.autoLockTimer)
    }

    // 设置新的定时器
    window.autoLockTimer = setTimeout(() => {
      if (isAuthenticatedRef.current() && !isLockedRef.current) {
        lockScreen()
      }
    }, lockTime)
  }, [lockTime, lockScreen])

  useEffect(() => {
    // 如果未登录或已锁定，不启动自动锁屏
    if (!isAuthenticated() || isLocked) {
      return
    }

    // 启动初始定时器
    resetTimer()

    // 监听用户活动事件
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    events.forEach((event) => {
      document.addEventListener(event, resetTimer)
    })

    // 清理函数
    return () => {
      if (window.autoLockTimer) {
        clearTimeout(window.autoLockTimer)
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [isAuthenticated, isLocked, resetTimer])
}

// 扩展 Window 接口以支持定时器属性
declare global {
  interface Window {
    autoLockTimer?: ReturnType<typeof setTimeout>
  }
}
