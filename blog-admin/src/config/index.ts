/**
 * 项目配置对象
 * 统一管理环境变量
 */

// 动态获取 WebSocket 地址
const getWsBaseUrl = () => {
  // 如果环境变量中配置了，直接使用
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL;
  }
  
  // 否则根据当前页面协议和域名自动生成
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}`;
  }
  
  // 服务端渲染或构建时的默认值
  return 'ws://localhost:8888';
};

const config = {
  // API 基础路径
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // WebSocket 基础路径
  wsBaseUrl: getWsBaseUrl(),
  
  // 上传接口地址
  uploadUrl: import.meta.env.VITE_UPLOAD_URL || '/api/upload',
  
  // 资源访问前缀
  resourcePrefix: import.meta.env.VITE_UPLOAD_RESOURCE_PREFIX || '/uploads',
  
  // 最大上传限制 (字节)
  maxUploadSize: Number(import.meta.env.VITE_UPLOAD_MAX_SIZE) || 10 * 1024 * 1024,
  
  // 应用标题
  appTitle: import.meta.env.VITE_APP_TITLE || '博客管理系统',
  
  // 应用版本
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // 本地存储前缀
  storagePrefix: import.meta.env.VITE_STORAGE_PREFIX || 'blog_admin_',
  
  // 是否为开发模式
  isDev: import.meta.env.MODE === 'development',
  
  // 是否开启 Mock
  mockEnabled: import.meta.env.VITE_MOCK_ENABLED === 'true',
};

export default config;
