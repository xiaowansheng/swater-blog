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

request.interceptors.response.use(
  (response) => {
    const res: Result<unknown> = response.data
    if (res.code === 200) {
      // 拦截器将业务数据从 AxiosResponse 中解包返回，属于 axios 类型契约的固有妥协
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return res.data as any
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
  },
  (error) => {
    message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
