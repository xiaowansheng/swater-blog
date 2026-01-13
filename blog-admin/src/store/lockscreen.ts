import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LockscreenState {
  isLocked: boolean
  lockScreen: () => void
  unlockScreen: (password: string) => boolean
  getCorrectPassword: () => string
}

export const useLockscreenStore = create<LockscreenState>()(
  persist(
    (set, get) => ({
      isLocked: false,

      lockScreen: () => {
        set({ isLocked: true })
      },

      unlockScreen: (password: string) => {
        const correctPassword = get().getCorrectPassword()
        if (password === correctPassword) {
          set({ isLocked: false })
          return true
        }
        return false
      },

      getCorrectPassword: () => {
        return String(new Date().getFullYear())
      },
    }),
    {
      name: 'lockscreen-storage',
    }
  )
)
