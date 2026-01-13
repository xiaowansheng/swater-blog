import { create } from 'zustand'

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting'

interface WebSocketState {
  status: ConnectionStatus
  connectedAt: number | null
  reconnectAttempts: number
  lastError: string | null
  setStatus: (status: ConnectionStatus) => void
  setConnectedAt: (timestamp: number) => void
  setReconnectAttempts: (attempts: number) => void
  setLastError: (error: string | null) => void
  reset: () => void
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: 'disconnected',
  connectedAt: null,
  reconnectAttempts: 0,
  lastError: null,

  setStatus: (status) => set({ status }),

  setConnectedAt: (timestamp) => set({ connectedAt: timestamp }),

  setReconnectAttempts: (attempts) => set({ reconnectAttempts: attempts }),

  setLastError: (error) => set({ lastError: error }),

  reset: () =>
    set({
      status: 'disconnected',
      connectedAt: null,
      reconnectAttempts: 0,
      lastError: null,
    }),
}))
