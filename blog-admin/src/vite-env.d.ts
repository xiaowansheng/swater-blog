/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_BASE_URL: string
  readonly VITE_UPLOAD_URL: string
  readonly VITE_UPLOAD_RESOURCE_PREFIX: string
  readonly VITE_UPLOAD_MAX_SIZE: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_STORAGE_PREFIX: string
  readonly VITE_MOCK_ENABLED: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
