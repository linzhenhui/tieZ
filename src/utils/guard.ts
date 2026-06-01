import { useUserStore } from '@/store/user'

let jumpingToLogin = false

export const requireLogin = (
  redirectUrl: string,
  requiredRole?: 'shipper' | 'fleet'
) => {
  const userStore = useUserStore()

  // 未登录
  if (!userStore.isLogin) {
    if (jumpingToLogin) return false
    jumpingToLogin = true

    userStore.setRedirectAfterLogin(redirectUrl)

    uni.redirectTo({
      url: '/pages/login/index',
      complete: () => {
        setTimeout(() => {
          jumpingToLogin = false
        }, 300)
      }
    })

    return false
  }

  // 角色不匹配
  if (requiredRole && userStore.role !== requiredRole) {
    uni.showToast({
      title: '当前账号角色不匹配',
      icon: 'none'
    })

    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }, 300)

    return false
  }

  return true
}