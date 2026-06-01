import { BASE_URL } from '@/config/env'

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

function showLoading(title = '加载中...') {
  uni.showLoading({
    title,
    mask: true
  })
}

function hideLoading() {
  uni.hideLoading()
}

// 登录白名单：这两个接口不带 access_token
const NO_TOKEN_URLS = ['/wechat/auth/login', '/wechat/login']

export function http<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const url = options.url || ''

    // 是否需要携带 token
    const needToken = !NO_TOKEN_URLS.some((item) => url.includes(item))

    if (options.showLoading) {
      showLoading()
    }

    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(needToken && token ? { access_token: token } : {}),
        ...options.header
      },
      success: (res) => {
        if (options.showLoading) hideLoading()

        const { statusCode, data } = res


        if (statusCode && statusCode >= 200 && statusCode < 300) {
          const result = data as ApiResponse<T> | T
          console.log("🚀 ~ http ~ result:", result)


          const apiResult = result as ApiResponse<T>
          if (apiResult.code == 1) {
            uni.removeStorageSync('token')
            uni.showToast({
              title: '登录已过期',
              icon: 'none'
            })
            uni.redirectTo({
              url: '/pages/login/index',
            })
            reject(res)
            return
          }
          if (apiResult.code == 0 || apiResult.code === 200) {
            resolve(apiResult.data)
          } else {
            uni.showToast({
              title: apiResult.message || '请求失败',
              icon: 'none'
            })
            reject(apiResult)
          }

        } else {
          uni.showToast({
            title: '服务异常',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        if (options.showLoading) hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}
