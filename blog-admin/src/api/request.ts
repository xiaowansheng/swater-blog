import axios, { AxiosInstance } from 'axios'
import { message } from 'antd'
import { Result } from '@/types'
import config from '@/config'
import { useAuthStore } from '@/store/auth'

const request: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  withCredentials: true,
})

/**
 * 按业务码统一处理响应体。
 * 后端 GlobalExceptionHandler 现在把业务码映射为真实 HTTP 状态码，
 * 故 HTTP 200(正常业务) 与非 2xx(业务异常) 都会带上标准 Result body，
 * 在此集中解析、避免 success/error 两个分支各写一份。
 * 返回值：成功时为解包后的 data（类型契约让步为 any）；失败时为 reject(Error)。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleResult(res: Result<unknown>): any {
  if (res.code === 200) {
    // 拦截器将业务数据从 AxiosResponse 中解包返回，属于 axios 类型契约的固有妥协
    return res.data
  }
  if (res.code === 401) {
    const authStore = useAuthStore.getState()
    if (!authStore.isLoginExpiredModalOpen) {
      authStore.setLoginExpiredModalOpen(true)
    }
    return Promise.reject(new Error('未登录'))
  }
  if (res.code === 403) {
    message.error(res.message || '无权限操作')
    return Promise.reject(new Error(res.message || '无权限操作'))
  }
  message.error(res.message || '请求失败')
  return Promise.reject(new Error(res.message || '请求失败'))
}

request.interceptors.response.use(
  // 拦截器解包业务数据返回，偏离 axios 默认的 AxiosResponse 契约（见上方注释），
  // 因此不强注返回类型，沿用历史解包约定。
  (response) => {
    // 后端在 2xx 时也以 Result 包裹业务数据，统一走 handleResult
    return handleResult(response.data as Result<unknown>)
  },
  (error) => {
    // 非业务异常（网络中断、超时、CORS 等）：error.response 缺失
    const body = error?.response?.data as Result<unknown> | undefined
    if (body && typeof body.code === 'number') {
      // 后端用真实 HTTP 状态码返回的业务异常，仍带标准 Result body，复用同一处理逻辑。
      // 进入此分支的状态码必为 4xx/5xx，handleResult 只会走到 reject 路径。
      return handleResult(body) as Promise<never>
    }
    message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
