// 测试环境浏览器 API 桩：纯工具函数与 zustand store 的单测在 node 环境运行，
// 涉及 localStorage / document 的模块依赖这些全局对象。

const memoryStorage = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, String(value))
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key)
    },
    clear: () => {
      memoryStorage.clear()
    },
  },
  writable: true,
  configurable: true,
})

Object.defineProperty(globalThis, 'document', {
  value: {
    cookie: '',
  },
  writable: true,
  configurable: true,
})
