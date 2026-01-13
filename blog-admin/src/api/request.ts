import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { getToken } from '@/utils/storage'
import { Result } from '@/types'
import config from '@/config'
import { useAuthStore } from '@/store/auth'

const request: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
})

let isShowingModal = false

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
      if (!isShowingModal) {
        isShowingModal = true
        useAuthStore.getState().setLoginExpiredModalOpen(true)
        // 重置状态，允许下次触发
        setTimeout(() => {
          isShowingModal = false
        }, 1000)
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

