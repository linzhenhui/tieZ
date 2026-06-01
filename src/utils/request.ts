import { BASE_URL } from '@/config/env'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions<T = any> {
  url: string
  method?: RequestMethod
  data?: Record<string, any> | any
  header?: Record<string, string>
  showError?: boolean
  needAuth?: boolean
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const getToken = () => {
  return uni.getStorageSync('token') || ''
}

const handleUnauthorized = () => {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')

  uni.showToast({
    title: '登录已失效，请重新登录',
    icon: 'none'
  })
}

export const request = <T = any>(options: RequestOptions): Promise<T> => {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showError = true,
    needAuth = true
  } = options

  const token = getToken()

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { access_token: token } : {}),
        ...header
      },
      success: (res) => {
        const statusCode = res.statusCode
        const result = res.data as ApiResponse<T>

        if (statusCode === 401) {
          handleUnauthorized()
          reject(new Error('Unauthorized'))
          return
        }

        if (statusCode >= 200 && statusCode < 300) {
          if (typeof result?.code === 'number') {
            if (result.code === 0 || result.code === 200) {
              resolve(result.data)
              return
            }

            if (result.code === 401) {
              handleUnauthorized()
              reject(new Error(result.message || 'Unauthorized'))
              return
            }

            if (showError) {
              uni.showToast({
                title: result.message || '请求失败',
                icon: 'none'
              })
            }

            reject(new Error(result.message || 'Request Error'))
            return
          }

          resolve(res.data as T)
          return
        }

        if (showError) {
          uni.showToast({
            title: '服务异常，请稍后重试',
            icon: 'none'
          })
        }

        reject(new Error(`HTTP Error: ${statusCode}`))
      },
      fail: (err) => {
        if (showError) {
          uni.showToast({
            title: '网络异常，请检查网络',
            icon: 'none'
          })
        }
        reject(err)
      }
    })
  })
}

export const get = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
  request<T>({
    url,
    method: 'GET',
    data,
    ...options
  })

export const post = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
  request<T>({
    url,
    method: 'POST',
    data,
    ...options
  })

export const put = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
  request<T>({
    url,
    method: 'PUT',
    data,
    ...options
  })

export const del = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
  request<T>({
    url,
    method: 'DELETE',
    data,
    ...options
  })

export const uploadFile = <T = any>(filePath: string, name = 'file'): Promise<T> => {
  const token = getToken()

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/api/common/upload/aly`,
      filePath,
      name,
      header: token ? { access_token: token } : {},
      success: (res) => {
        try {
          const result = JSON.parse(res.data) as ApiResponse<T>

          if (result.code === 0 || result.code === 200) {
            resolve(result.data)
            return
          }

          if (result.code === 401) {
            handleUnauthorized()
            reject(new Error(result.message || 'Unauthorized'))
            return
          }

          uni.showToast({
            title: result.message || '上传失败',
            icon: 'none'
          })
          reject(new Error(result.message || 'Upload Error'))
        } catch (e) {
          uni.showToast({
            title: '上传响应解析失败',
            icon: 'none'
          })
          reject(e)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}