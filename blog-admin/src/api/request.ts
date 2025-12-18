import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { getToken, removeToken } from '@/utils/storage'
import { Result } from '@/types'

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
})

request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const res: Result<any> = response.data
    if (res.code === 200) {
      return res.data
    }
    if (res.code === 401) {
      removeToken()
      window.location.href = '/login'
      return Promise.reject(new Error('未登录'))
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

